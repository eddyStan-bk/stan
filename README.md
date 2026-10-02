# OSME — Observatoire de santé de la mère et de l’enfant

Plateforme de surveillance des décès maternels et périnatals en RDC (ERSP-UCB, Caritas Congo, Coopération suisse). Production : https://osm.erspdrc.com

Consignes de développement : [`CLAUDE.md`](CLAUDE.md). Charte graphique : [`docs/CHARTE_GRAPHIQUE.md`](docs/CHARTE_GRAPHIQUE.md).

## Contenu du dépôt

```
CLAUDE.md                    consignes du projet (code, sécurité, charte, Astro)
docs/CHARTE_GRAPHIQUE.md     charte graphique
docs/API_PUBLIQUE.md         contrat des endpoints api/public/*.php lus par le portail
assets/css/osme-tokens.css   jetons de la charte : source unique (PHP et Astro)
assets/fonts/                Lexend et Source Sans 3 (WOFF2 variables, auto-hébergées)
frontend/                    portail public en Astro (statique)
```

L’application PHP (`pages/`, `includes/`, `db/`…) n’est pas encore versionnée ici.

## Portail public (Astro)

Pages : accueil, indicateurs (vue d’ensemble, mortalité maternelle, mortalité périnatale), publications, à propos, mentions légales, protection des données, recherche (Pagefind), page 404.

```bash
cd frontend
npm install
npm run dev          # http://localhost:4321
npm run check        # astro check (types et diagnostics)
npm run build        # → frontend/dist (+ index de recherche dans dist/_recherche)
npm run build:demo   # données fictives, bandeau « démonstration » et noindex
```

Variables de build (voir `frontend/.env.example`) :

| Variable | Effet |
| --- | --- |
| `OSME_API_URL` | Lit les agrégats et les publications sur `…/api/public/*.php`. |
| `OSME_API_REQUIRED=1` | Fait échouer le build si l’API ne répond pas. |
| `OSME_DEMO_DATA=1` | Données fictives : ne jamais déployer ce build. |

Sans API, le portail se construit avec des états vides (« Les indicateurs validés seront publiés ici ») : aucun chiffre inventé.

### Déploiement (hébergement mutualisé, sans Node)

1. `OSME_API_URL=https://osm.erspdrc.com OSME_API_REQUIRED=1 npm run build`
2. Copier le contenu de `frontend/dist/` à la racine publique. Les pages sont des dossiers (`/indicateurs/index.html`…), les ressources sont dans `/_portail/` et `/_recherche/` : aucune collision avec les routes PHP réservées.
3. Tant que `.htaccess` garde `DirectoryIndex index.php`, l’accueil PHP reste en place ; passer à `DirectoryIndex index.html index.php` (avec accord) pour basculer l’accueil vers Astro, et rediriger en 301 les anciennes URL `article.php?…`.
4. Le symbole du logo est lu depuis `/assets/images/logo/logo-mark.png` : le copier aussi dans `frontend/public/assets/images/logo/` pour qu’il s’affiche dans l’en-tête et serve d’icône d’onglet.

### Avant la mise en production

- Compléter les mentions légales et la page « Protection des données » (blocs « À compléter », signalés aussi dans le journal de build).
- Écrire `api/public/indicators.php` et `api/public/publications.php` selon `docs/API_PUBLIQUE.md`, après export du schéma de la base.
- Faire valider par l’équipe épidémiologique le seuil de masquage (< 5 cas par zone et par mois).
