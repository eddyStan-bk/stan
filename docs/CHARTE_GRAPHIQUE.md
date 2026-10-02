# OSME — charte graphique

L'Observatoire de santé de la mère et de l'enfant (OSME) collecte, vérifie et publie les données de mortalité maternelle et périnatale en République démocratique du Congo, avec l'École régionale de santé publique de l'Université catholique de Bukavu (ERSP-UCB) et ses partenaires. La plateforme sert deux publics : le **portail public** (décideurs, chercheurs, presse, grand public) et l'**application** de surveillance (collecteurs, superviseurs, agents de santé, chercheurs, administrateurs), souvent utilisée sur téléphone, avec une connexion lente.

Trois idées guident toute la charte : **la dignité** (chaque chiffre est une femme ou un enfant), **la clarté** (une donnée doit se lire en 5 secondes, même sur un petit écran), **la confiance** (sources, dates et méthodes toujours visibles).

## Voix et contenus

L'OSME parle comme un service public de santé : précis, sobre, en français clair. Phrases courtes, voix active, vocabulaire du terrain (zone de santé, aire de santé, formation sanitaire, revue de décès).

- À faire : « 42 décès maternels notifiés au 2ᵉ trimestre 2026 dans la province du Sud-Kivu. » — le chiffre, la période, le lieu, dans cet ordre.
- À faire : nommer les actions par ce qu'elles font : « Enregistrer le dossier », « Valider la revue », « Exporter en PDF ».
- À éviter : le sensationnel (« alarmant », « explosion »), les points d'exclamation, les emojis, l'anglais quand un mot français existe (« tableau de bord », pas « dashboard » dans l'interface).
- À éviter : toute donnée individuelle identifiante sur le portail public. Le public ne voit que des agrégats.
- Les messages d'erreur disent ce qui s'est passé et comment corriger : « La date du décès ne peut pas précéder la date d'admission. »
- Majuscule seulement en début de phrase et aux noms propres, y compris dans les titres et boutons.
- Nombres : espace insécable pour les milliers (12 480), virgule décimale (3,7 ‰), unités et taux toujours précisés (pour 100 000 naissances vivantes).

## Couleurs

Le violet du logo (`violet-logo`, #8B46C9) est l'identité ; pour tout ce qui doit se lire ou se cliquer, on utilise `violet` (#6B2FB3), plus foncé, qui atteint 7,8:1 sur blanc. Le `violet-deep` porte les bandeaux institutionnels. La `sarcelle` est l'unique accent secondaire : elle signale le volet enfant / périnatal et équilibre le violet sans le concurrencer.

Règles d'usage :

- Un seul bouton principal (`violet` + `on-violet`) par écran, pour l'action pour laquelle la page existe.
- Les couleurs d'état (`danger`, `warning`, `success`, `info`) ne servent qu'à des états. Le rouge n'est jamais décoratif : sur une plateforme de mortalité, il doit garder son sens d'alerte.
- Texte coloré uniquement sur `surface`, `surface-alt` ou sur son fond `-soft` assorti. Jamais de texte violet sur sarcelle-soft ou l'inverse.
- Pas de dégradé violet-bleu, pas de dégradés décoratifs en général : aplats francs.
- Les anciennes couleurs du code (bleu #2563EB, marine #071C33, rouge #BF1834, violet #6F2DBD) sont remplacées par ces jetons.

## Typographie

- **Lexend** (titres, chiffres clés) : géométrique et arrondie comme le lettrage du logo, conçue pour la lisibilité.
- **Source Sans 3** (texte, formulaires, tableaux) : compacte, excellente en petit corps, chiffres tabulaires (`font-variant-numeric: tabular-nums`) pour les colonnes de données, accents français complets.
- Les deux polices sont **auto-hébergées** (fichiers WOFF2 dans `assets/fonts/`), jamais chargées depuis un CDN : l'application doit fonctionner sur des réseaux lents et le projet a supprimé toute dépendance externe.
- Échelle : `display` 48, `h1` 36, `h2` 28, `h3` 22, `kpi` 40 (Lexend) ; `body-lg` 18, `body` 16, `label` 15, `small` 14, `caption` 13 (Source Sans 3). Jamais de texte d'interface sous 13 px. Corps 16 px minimum dans les formulaires (évite le zoom automatique sur mobile).
- Lignes de texte de 75 caractères au plus. Pas de libellés en capitales.
- Georgia, Times et les polices système disparates encore présentes dans le CSS sont à retirer.

## Mise en page

- Grille sur 4 px ; espacements `space-1` à `space-16` uniquement.
- Portail public : conteneur de 1200 px, 12 colonnes, gouttière `space-6`. Application : barre latérale de 270 px, contenu fluide.
- Points de rupture testés : 360, 390, 768, 1024, 1366 px.
- Rayons : `radius-sm` pour les contrôles, `radius-md` pour les cartes, `radius-lg` pour les grands blocs du portail, `radius-pill` pour les badges de statut. Ne pas arrondir uniformément : la hiérarchie des rayons suit celle des éléments.
- Ombres réservées à ce qui flotte (menus, modales). Les cartes de l'application se distinguent d'abord par `line` et `surface-raised`.

## Motif : l'arc

Les trois arcs qui soulignent le logo sont le seul motif graphique de l'OSME. On les reprend en filet courbe `violet-logo` sous un titre de section du portail, en séparateur de bandeau, ou pour souligner la valeur courante dans un graphique. Un arc par bloc au maximum ; jamais en fond répété.

## Iconographie

Bootstrap Icons (déjà présent en local, `assets/vendor/bootstrap-icons`) est la bibliothèque unique ; Font Awesome est à retirer progressivement. Icônes en trait, 20 px dans l'interface, 16 px dans les tableaux, couleur `ink-muted` au repos et `violet` à l'état actif. Une icône accompagne toujours un libellé, sauf boutons universels (fermer, rechercher), qui portent alors un `aria-label`.

## Photographies

Images de femmes et d'enfants congolais dans des contextes de soins, prises avec consentement, dignes, jamais misérabilistes. Format WebP, 1600 px de large maximum, texte alternatif descriptif. Aucune photo de patiente identifiable associée à des données de décès.

## Logo

Le logo officiel combine la mère portant l'enfant et trois arcs. Zone de protection : la hauteur de la tête de la mère tout autour. Taille minimale : 32 px de haut pour le symbole seul, 120 px de large pour le logo complet. Sur `violet-deep`, utiliser une version monochrome blanche (à produire). Ne pas déformer, recolorer, ni ajouter d'ombre.

**À corriger :** le fichier `logo-officiel.png` actuel contient une coquille (« Chiid » au lieu de « Child ») et son texte est en anglais alors que la plateforme est francophone. Il faut faire redessiner le logo en vectoriel (SVG), en version française (« Observatoire de santé de la mère et de l'enfant »), avec déclinaisons couleur, monochrome et symbole seul.

## Accessibilité

Contraste de texte 4,5:1 minimum dans les deux thèmes (3:1 pour le texte ≥24 px, les bordures de champs et les icônes) — tous les couples de jetons ci-dessus ont été vérifiés. Focus clavier toujours visible (`focus`). Les états ne reposent jamais sur la couleur seule : un badge « Urgent » porte un mot et une icône. Cibles tactiles de 44 px minimum.

## Composants d'interface

Principes communs aux pages PHP (Bootstrap 5 surchargé par `osme-tokens.css`) et aux composants Astro.

### Boutons

- **Principal** : fond `violet`, texte `on-violet`, `radius-sm`, hauteur 44 px, `label` (15 px, 600). Un seul par écran.
- **Secondaire** : fond `surface-raised`, bordure `line-input`, texte `ink`.
- **Discret** : sans fond ni bordure, texte `violet`, pour « Annuler », « Voir tout ».
- **Destructif** : texte `danger` sur fond `surface-raised` ; ne devient plein `danger` que dans la modale de confirmation.
- Libellé = verbe + objet : « Enregistrer le dossier », « Valider la revue ». Jamais « OK » ou « Soumettre ».

### Badges de statut des dossiers

Forme `radius-pill`, texte `small` 600, fond `-soft` et texte de la couleur d'état, toujours précédés d'une icône :

| Statut | Jetons |
| --- | --- |
| Brouillon | `info` / `info-soft` |
| En attente de revue | `warning` / `warning-soft` |
| Validé | `success` / `success-soft` |
| Rejeté, urgent | `danger` / `danger-soft` |
| Module périnatal | `sarcelle` / `sarcelle-soft` |

### Formulaires de notification

Les formulaires de décès maternel et périnatal sont longs : les découper en étapes (identification, lieu, circonstances, causes, revue), avec une barre de progression et l'enregistrement automatique du brouillon. Libellé au-dessus du champ, aide en `ink-muted` sous le champ, erreur en `danger` sous le champ avec une icône. Bordure `line-input`, focus `focus`. Champs obligatoires signalés par le mot « obligatoire », pas seulement par un astérisque.

### Tableaux de données

En-tête sur `surface-alt`, texte `label`. Chiffres alignés à droite en chiffres tabulaires. Lignes de 48 px, filets `line` horizontaux uniquement. Sur mobile (< 768 px), chaque ligne devient une carte empilée plutôt qu'un défilement horizontal, sauf pour les tableaux d'analyse.

### Cartes indicateurs (KPI)

Valeur en `kpi` (Lexend 40), libellé en `small` `ink-muted` au-dessus, période et source en `caption` en dessous, variation avec flèche et mot (« en baisse de 12 % ») — jamais la couleur seule. Pas plus de quatre cartes par rangée.

### Navigation

Portail : en-tête blanc avec logo à gauche, menu, recherche, bouton « Se connecter » secondaire ; pied de page `violet-deep` avec logos partenaires en blanc. Application : barre latérale `surface-alt`, élément actif en `violet` sur `violet-soft`, regroupée par module (Mortalité maternelle, Mortalité périnatale, Référentiels, Administration).

## Données et graphiques

L'OSME publie des indicateurs de mortalité. La visualisation doit informer sans dramatiser et ne jamais permettre de réidentifier une personne.

### Palette de séries

`dv-1` violet (série principale), `dv-2` ocre (comparaison), `dv-3` ardoise (référence ou cible), `dv-4` sarcelle (périnatal), `dv-5` rose. Cinq séries au maximum ; au-delà, regrouper en « Autres » en `line-input`. Toujours étiqueter les séries directement sur le graphique plutôt que par légende seule, car l'ocre, la sarcelle et le rose ont des clartés proches.

### Règles

- Un graphique répond à une question écrite en titre : « Les décès maternels baissent-ils dans le Sud-Kivu ? », pas « Graphique 3 ».
- Source, période et date de mise à jour sous chaque graphique, en `caption`.
- Axes à zéro pour les barres. Taux toujours accompagnés de leur dénominateur (pour 100 000 naissances vivantes, pour 1 000 naissances).
- Petits effectifs : sur le portail public, masquer ou regrouper toute cellule inférieure à 5 cas par zone de santé et par mois (règle à valider par l'équipe épidémiologique).
- Cartes géographiques en aplats `violet` de 5 classes de clarté, du `violet-soft` au `violet-deep`, avec légende des seuils.
- Chart.js : définir une seule configuration commune (polices, couleurs, grille `line`, infobulles `surface-raised`) dans un module partagé, réutilisée par toutes les pages.
- Chaque graphique a un équivalent texte ou tableau accessible (bouton « Voir les données »).

## Référence des jetons

Variables CSS définies dans `assets/css/osme-tokens.css` (préfixe `--osme-`). Version interactive : https://claude.ai/artifact/CPuAmpbnwC4FYVUJDVsPnZ

### Couleurs

| Jeton | Clair | Sombre | Usage |
| --- | --- | --- | --- |
| `--osme-surface` | `#FFFFFF` | `#16121F` | Fond de page (portail public et application). |
| `--osme-surface-alt` | `#F7F5FA` | `#1F1A2B` | Sections alternées, fond de la barre latérale, en-têtes de tableaux. |
| `--osme-surface-raised` | `#FFFFFF` | `#241E31` | Cartes, modales, menus déroulants posés sur surface-alt. |
| `--osme-line` | `#E3DEEA` | `#362E45` | Filets, séparateurs, bordures de cartes et de tableaux (décoratif, non porteur d'information). |
| `--osme-line-input` | `#8C8499` | `#7A7189` | Bordure des champs de formulaire, cases et boutons radio (3:1 sur surface). |
| `--osme-ink` | `#1C1726` | `#EEEAF4` | Texte principal sur surface, surface-alt, surface-raised et violet-soft. |
| `--osme-ink-muted` | `#5D566A` | `#A9A2B6` | Texte secondaire, métadonnées, légendes, aides de saisie, sur toutes les surfaces. |
| `--osme-violet` | `#6B2FB3` | `#C9A6F2` | Couleur d'action OSME : bouton principal, liens, onglet actif, icônes actives. Texte lisible sur les surfaces et violet-soft. |
| `--osme-violet-logo` | `#8B46C9` | `#B793E6` | Violet exact du logo. Aplats de marque, illustrations, arcs décoratifs, texte ≥24 px seulement (3,35:1 en sombre). |
| `--osme-violet-deep` | `#34175C` | `#2A1F3D` | Bandeaux institutionnels, pied de page, en-tête du portail public. Texte : on-violet (clair) ou ink (sombre). |
| `--osme-violet-soft` | `#F3ECFB` | `#2A1F3D` | Fond teinté derrière du texte violet : badges, ligne sélectionnée, encadrés d'information OSME. |
| `--osme-on-violet` | `#FFFFFF` | `#16121F` | Texte et icônes posés sur un aplat violet ou violet-logo (libellé du bouton principal). |
| `--osme-sarcelle` | `#0B6F6E` | `#5FD0CC` | Accent secondaire : santé de l'enfant, nouveau-né, module périnatal. Texte lisible sur surface et sarcelle-soft. |
| `--osme-sarcelle-soft` | `#E3F3F2` | `#0D2A2A` | Fond teinté derrière du texte sarcelle (badges du module périnatal). |
| `--osme-danger` | `#B42318` | `#FF8A80` | Erreurs, suppression, alertes de décès non notifiés, dépassement de délai. Jamais décoratif. |
| `--osme-danger-soft` | `#FDECEA` | `#3A1512` | Fond des messages d'erreur et badges « Urgent ». |
| `--osme-warning` | `#9A5B00` | `#F5C26B` | Avertissements : dossier incomplet, revue en attente, délai proche. |
| `--osme-warning-soft` | `#FFF4DB` | `#33240A` | Fond des avertissements et badges « En attente ». |
| `--osme-success` | `#1B7A43` | `#7CD3A0` | Confirmations : dossier validé, revue clôturée, enregistrement réussi. |
| `--osme-success-soft` | `#E6F4EC` | `#0F2A1B` | Fond des confirmations et badges « Validé ». |
| `--osme-info` | `#1F5FA6` | `#8DB8F0` | Information neutre, aide contextuelle, statut « Brouillon ». |
| `--osme-info-soft` | `#E7F0FA` | `#0F2033` | Fond des encadrés d'information neutre. |
| `--osme-focus` | alias {violet} | alias {violet} | Anneau de focus clavier : 2 px d'écart couleur de page, puis 2 px plein violet. |
| `--osme-link` | alias {violet} | alias {violet} | Liens dans le texte, toujours soulignés dans un paragraphe. |
| `--osme-dv-1` | `#6B2FB3` | `#B793E6` | Série de données n°1 (série principale : décès maternels, indicateur OSME). |
| `--osme-dv-2` | `#B57600` | `#F0B94A` | Série n°2 (comparaison, période précédente). Ajouter une étiquette directe. |
| `--osme-dv-3` | `#4F6382` | `#9FB1CC` | Série n°3 (référence nationale ou cible). |
| `--osme-dv-4` | `#0E8C88` | `#4CC3BE` | Série n°4 (décès périnatals, nouveau-nés). |
| `--osme-dv-5` | `#C0457A` | `#E87FA8` | Série n°5. Au-delà de 5 séries, regrouper en « Autres ». |

### Typographie

| Style | Police | Taille / interligne | Graisse |
| --- | --- | --- | --- |
| `display` | Lexend | 48px / 54px | 600 |
| `h1` | Lexend | 36px / 44px | 600 |
| `h2` | Lexend | 28px / 36px | 600 |
| `h3` | Lexend | 22px / 30px | 500 |
| `kpi` | Lexend | 40px / 44px | 600 |
| `body-lg` | Source Sans 3 | 18px / 28px | 400 |
| `body` | Source Sans 3 | 16px / 24px | 400 |
| `label` | Source Sans 3 | 15px / 20px | 600 |
| `small` | Source Sans 3 | 14px / 20px | 400 |
| `caption` | Source Sans 3 | 13px / 18px | 400 |

### Espacements, rayons, ombres

| Jeton | Valeur | Usage |
| --- | --- | --- |
| `--osme-space-1` | `4px` | Écart icône–texte, padding vertical des badges. |
| `--osme-space-2` | `8px` | Écart entre éléments d'un même groupe (boutons côte à côte). |
| `--osme-space-3` | `12px` | Padding des cellules de tableau, écart libellé–champ. |
| `--osme-space-4` | `16px` | Padding des cartes sur mobile, écart entre champs. |
| `--osme-space-6` | `24px` | Padding des cartes sur desktop, gouttière de grille. |
| `--osme-space-8` | `32px` | Écart entre blocs d'une page. |
| `--osme-space-12` | `48px` | Écart entre sections du portail sur mobile. |
| `--osme-space-16` | `64px` | Écart entre sections du portail sur desktop. |
| `--osme-radius-sm` | `8px` | Champs, boutons, badges carrés, cellules de graphiques. |
| `--osme-radius-md` | `14px` | Cartes, encadrés, modales (valeur héritée de --osme-radius). |
| `--osme-radius-lg` | `22px` | Grands blocs du portail public, images éditoriales. |
| `--osme-radius-pill` | `999px` | Badges de statut, filtres, avatars. |
| `--osme-shadow-sm` | `0 2px 6px rgba(28, 23, 38, 0.06)` | Cartes au repos dans l'application. |
| `--osme-shadow-md` | `0 10px 24px rgba(28, 23, 38, 0.08)` | Menus déroulants, cartes survolées cliquables. |
| `--osme-shadow-lg` | `0 24px 60px rgba(28, 23, 38, 0.16)` | Modales uniquement. |
