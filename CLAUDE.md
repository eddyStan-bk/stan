# CLAUDE.md — OSME (Observatoire de santé de la mère et de l'enfant)

Plateforme de surveillance des décès maternels et périnatals en RDC, portée par l'ERSP-UCB (Bukavu) avec Caritas Congo et la Coopération suisse. Production : https://osm.erspdrc.com (Hostinger mutualisé, Apache + PHP 8.2 + MySQL/MariaDB).

Deux faces :
- **Portail public** (`index.php`, `article.php`, `recherche.php`, `modules.php`, `modules/…`, pages légales) : indicateurs agrégés, actualités, publications.
- **Application authentifiée** (`pages/…`) : notification, revue, validation et export des décès, référentiels géographiques, utilisateurs, contenus.

Ce sont des **données de santé sensibles** (décès de femmes et de nouveau-nés). La confidentialité passe avant toute fonctionnalité.

Charte graphique (à respecter pour toute interface) : @docs/CHARTE_GRAPHIQUE.md
Jetons CSS : `assets/css/osme-tokens.css`

## Langue

- Interface, messages, commentaires de code et documentation : **français**.
- Identifiants (variables, fonctions, tables, colonnes, fichiers PHP) : anglais, comme l'existant (`maternal_deaths`, `save_health_area.php`). Les dossiers métier historiques restent en français (`deces_maternel/`, `deces_perinatal/`) : ne pas les renommer.

## Commandes

```bash
# Vérifier la syntaxe de tout le PHP (à lancer après chaque modification PHP)
find . -name '*.php' -not -path './libs/*' -not -path './frontend/*' -not -path './vendor/*' -print0 | xargs -0 -n1 -P4 php -l | grep -v 'No syntax errors'

# Serveur local : utiliser XAMPP/Laragon (Apache requis pour .htaccess : /login, /dashboard).
# `php -S` ne lit pas .htaccess → les URL propres ne fonctionnent pas avec lui.

# Portail Astro (une fois frontend/ créé)
cd frontend && npm install
npm run dev        # http://localhost:4321
npm run build      # → frontend/dist
npx astro check    # types et diagnostics
```

En local, `.env` doit contenir `OSME_APP_URL=http://localhost/<dossier>` : sinon `config.php` force l'URL de production et toutes les redirections partent vers osm.erspdrc.com.

## Architecture PHP actuelle

```
config.php               constantes (BASE_PATH, BASE_URL, APP_KEY, PRIVATE_STORAGE_PATH…), chargement .env
db/connexion.php         crée $pdo (PDO MySQL, utf8mb4, exceptions, pas d'émulation)
includes/bootstrap.php   session sécurisée, en-têtes, helpers : e(), base_url(), asset(), redirect_to(),
                         csrf_field(), csrf_require_valid(), flash_set/get(), auth_*(), role_label(),
                         private_file_url(), health_location_is_valid(), case_status_is_valid()
pages/auth_check.php     exige une session ; auth_require_role([...]), auth_require_admin()
includes/role_check.php  can_create_death(), can_edit_death(), can_delete_death(), can_validate_death()
includes/                sidebar.php, sidebar_admin.php, topbar.php, footer.php
pages/<module>/          liste, *_create, *_edit, *_view (GET) / save_*, update_*, delete_* (POST)
pages/files/secure_download.php   seul point de sortie des fichiers privés (signature HMAC + rôle)
libs/fpdf/               export PDF des fiches (bibliothèque tierce : ne pas modifier)
database/migrations/     scripts SQL datés
storage/private/         pièces cliniques (hors web en prod via OSME_PRIVATE_STORAGE)
```

`bootstrap.php` est la **seule** source des helpers. Ne pas redéfinir `e()`, `base_url()` ou `asset()` dans une page (des doublons existent encore dans `index.php` et `includes/sidebar.php` : à supprimer lors d'une refonte de ces fichiers).

### Rôles (IDs figés, ne jamais supprimer ni renuméroter)

| ID | Clé | Droits principaux |
|---:|---|---|
| 1 | ADMIN | tout, dont suppression, utilisateurs, rôles, référentiels, contenus, avatars |
| 2 | SUPERVISOR | créer, modifier, valider les dossiers ; pièces cliniques ; analyses |
| 3 | COLLECTOR | collecte, consultation des listes de dossiers |
| 4 | HEALTH_AGENT | accès limité à sa structure sanitaire |
| 5 | RESEARCHER | consultation et analyse autorisées |

### Modèle de données (tables principales)

- Géographie : `countries` → `provinces` → `health_zones` → `health_areas` → `health_facilities` (+ `facility_types`). Toute saisie de lieu passe par `health_location_is_valid()`.
- Cas : `maternal_deaths` (décès maternels), `child_deaths` (= module **périnatal** dans l'interface), `case_statuses` (`status_group` = `maternal` | `child`, contrôlé par `case_status_is_valid()`), `case_attachments`.
- Collecte : `collectors`, `notifiers`, `collection_sessions`, `weeks`, `activities`.
- Contenus du portail : `content_categories`, `thematic_branches`, `publication_formats` (+ table des contenus gérée par `pages/admin/content_admin_helpers.php`).
- Système : `users`, `roles`, `audit_logs`, `notifications`, `login_attempts`, `newsletter_subscribers`.

Le schéma complet n'est pas versionné ici : demander un export de structure (sans données) avant toute requête touchant une table que tu n'as pas vue.

## Règles de code PHP

Gabarit d'une page protégée dans `pages/<module>/` :

```php
<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/auth_check.php';      // session obligatoire + helpers
require_once BASE_PATH . '/includes/role_check.php';
require_once BASE_PATH . '/db/connexion.php';           // fournit $pdo

auth_require_role([1, 2]);                              // toujours explicite
```

Gestionnaire POST : `csrf_require_valid('chemin/de/retour')` en première ligne, validation serveur de chaque champ, transaction PDO si plusieurs tables, entrée dans `audit_logs` pour toute création / modification / validation / suppression de dossier, puis `flash_set()` + `redirect_to(..., 303)` (PRG).

Obligatoire :
- SQL : requêtes préparées à paramètres nommés uniquement. Jamais de variable concaténée dans du SQL ; pour un tri dynamique, liste blanche de colonnes.
- Sortie HTML : `e()` sur toute valeur dynamique, y compris dans les attributs.
- Liens et ressources : `base_url()` / `asset()`, jamais de chemins relatifs du type `../../assets/…` (encore présents : les remplacer quand tu touches un fichier).
- Fichiers téléversés : vérification MIME avec `finfo`, taille ≤ `MAX_UPLOAD_BYTES`, nom régénéré, stockage sous `PRIVATE_STORAGE_PATH`, lecture via `private_file_url()` uniquement.
- Autorisations vérifiées côté serveur dans chaque script, y compris les endpoints AJAX (`get_*.php`). Masquer un bouton ne suffit pas.
- Erreurs : `error_log('[OSME][module] …')` côté serveur, message générique côté utilisateur. Ne jamais journaliser de données de patiente.
- `declare(strict_types=1);`, fins de ligne LF, indentation 4 espaces, PSR-12 pour le nouveau code.

Interdit sans accord explicite :
- Modifier le schéma de base (écrire plutôt une migration idempotente `database/migrations/AAAA_MM_JJ_description.sql` et la soumettre).
- Toucher `.env`, `config.php` (secrets), les redirections canoniques de `.htaccess`, `libs/fpdf/`.
- Exposer une donnée individuelle (nom, date de naissance, structure + date) sans authentification. Le portail public ne montre que des agrégats ; masquer les cellules < 5 cas par zone et par mois.
- Ajouter un CDN ou une ressource externe : tout est servi localement (réseaux lents, choix du projet).

## Interface et charte graphique

- Lire @docs/CHARTE_GRAPHIQUE.md avant tout travail d'interface. Utiliser uniquement les variables `--osme-*` d'`assets/css/osme-tokens.css` : aucune couleur, police ou ombre en dur.
- `osme-tokens.css` se charge **après** `bootstrap.min.css` et après les anciennes feuilles (`mystyle.css`, `home-observatoire.css`, `dashboard-admin.css`…). Il contient des alias (`--osme-primary`, `--osme-purple`, `--navy`, `--red`…) qui font basculer l'ancien CSS vers la charte ; quand une feuille est réécrite, remplacer les alias par les vrais jetons.
- Trois palettes coexistent aujourd'hui (bleu #2563EB, marine/rouge #071C33/#BF1834, violet #6F2DBD) et Georgia est utilisée comme police de titre : les éliminer au fil des modifications.
- Polices : Lexend (titres, chiffres clés) et Source Sans 3 (texte), auto-hébergées dans `assets/fonts/`.
- Icônes : Bootstrap Icons (local). Ne plus ajouter de Font Awesome.
- Responsive testé à 360, 390, 768, 1024 et 1366 px. Cibles tactiles ≥ 44 px, focus visible, contraste AA.
- Libellés : verbe + objet, phrase en minuscules (« Enregistrer le dossier »).

## Astro (portail public)

Objectif : reconstruire le **portail public** en Astro, statique, sans toucher à l'application PHP. L'hébergement est mutualisé : **pas de Node en production**, Astro est compilé avant déploiement.

```
frontend/                      projet Astro (hors dossier public en prod)
  astro.config.mjs             site: 'https://osm.erspdrc.com', output: 'static', build.format: 'directory'
  src/layouts/BaseLayout.astro en-tête, pied de page, méta, polices
  src/components/              Header, Footer, KpiCard, Chart (île), StatusBadge…
  src/pages/                   index, a-propos, publications/[slug], modules/…, mentions-legales…
  src/styles/global.css        @import des jetons (assets/css/osme-tokens.css = source unique)
api/public/                    nouveaux endpoints PHP JSON en lecture seule, agrégats uniquement
```

Principes :
- PHP reste maître de : connexion, tableaux de bord, `pages/…`, exports PDF, `secure_download.php`, newsletter, administration des contenus.
- Les données dynamiques du portail viennent d'endpoints `api/public/*.php` : GET uniquement, réponse JSON, aucune donnée individuelle, `Cache-Control` court, pas de session requise. Astro les lit au build (pages d'articles) ou côté client dans une île (indicateurs « en direct »).
- Îles (`client:visible`) seulement pour les graphiques et la recherche ; le reste en HTML statique, zéro JS par défaut.
- Recherche publique : Pagefind sur le site statique plutôt que `recherche.php` à terme.
- Polices via `@fontsource-variable/lexend` et `@fontsource-variable/source-sans-3` ; Chart.js 4 dans les îles (le PHP utilise encore une ancienne version de Chart.js : API différente, ne pas copier les configurations telles quelles).
- Les routes générées ne doivent pas entrer en collision avec PHP : `/login`, `/dashboard`, `/pages/…`, `/api/…`, `/storage/…`, `/uploads/…` sont réservées.
- Déploiement : `npm run build`, puis copie de `frontend/dist/*` à la racine publique. Quand l'accueil Astro remplace `index.php`, passer `DirectoryIndex index.html index.php` dans `.htaccess` (avec accord) et rediriger en 301 les anciennes URL `article.php?…` vers les nouvelles.
- Pour éviter de maintenir deux en-têtes, le build Astro peut produire des fragments `header.html` / `footer.html` que les pages PHP publiques incluent.
- Migrer page par page : accueil, puis pages légales, puis publications, puis modules. Chaque étape doit laisser le site fonctionnel.

## Problèmes connus (à traiter en priorité)

1. **Critique** — `db/connexion.php` contient un mot de passe MySQL en dur comme valeur par défaut d'`OSME_DB_PASS`. Remplacer par `''` (comme dans `osme_professional.zip`), et signaler qu'il faut changer ce mot de passe sur Hostinger : il a circulé dans des archives.
2. **Critique** — `osme_professional.zip` (8,8 Mo, copie du code) est à la racine publique et téléchargeable. Le supprimer du serveur et bloquer `\.(zip|tar|gz|7z|bak|sql)$` dans `.htaccess`.
3. `default.php` (page par défaut Hostinger) : à supprimer.
4. `APP_KEY` retombe sur une clé dérivée du chemin si `OSME_APP_KEY` manque : en production, refuser de démarrer sans clé.
5. `assets/plugins/fontawesome-free/` et `assets/plugins/chart.js/` sont référencés par ~50 pages mais absents du dossier public : icônes et graphiques cassés. Restaurer depuis l'archive ou migrer vers Bootstrap Icons / Chart.js 4.
6. `osme_detect_base_url()` : la valeur par défaut de production rend la détection automatique inatteignable (voir la note `.env` local plus haut).
7. Fichiers monolithiques de 40 à 66 Ko (`dashboard_admin.php`, `dashboard_smart.php`, `maternal_death_edit.php`, `perinatal_death_edit.php`…) mêlant SQL, logique, HTML, CSS et JS en ligne : extraire progressivement les requêtes dans `includes/repositories/` et le CSS/JS dans `assets/`, sans réécriture massive.
8. Fins de ligne mixtes CRLF/LF : ajouter un `.gitattributes` (`* text=auto eol=lf`).
9. Contraintes d'unicité sur `form_number` en attente (`database/migrations/2026_08_01_integrity_checks.sql`).
10. Le logo (`assets/images/logo/logo-officiel.png`) contient une coquille (« Chiid ») et est en anglais : ne pas l'utiliser dans de nouveaux gabarits avant sa refonte en SVG ; utiliser `logo-mark.png` + le nom en texte.

## Façon de travailler

- Avant une modification transverse (plus de 3 fichiers, schéma, sécurité, `.htaccess`), proposer un plan et attendre validation.
- Changements petits et ciblés ; ne pas reformater un fichier entier en passant.
- Après une modification : `php -l` sur les fichiers touchés, puis indiquer quoi tester à la main (rôle, page, largeur d'écran) puisqu'il n'y a pas de tests automatisés.
- Ajouter toute modification notable à `CHANGELOG_MISE_A_JOUR.md`.
- Ce fichier et tous les `.md` sont bloqués en HTTP par `.htaccess` : conserver cette règle.
