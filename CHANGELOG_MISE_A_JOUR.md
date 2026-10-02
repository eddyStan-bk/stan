# Journal des mises à jour

## 2026-10-02 — Portail public Astro (première version)

- Ajout du kit de projet : `CLAUDE.md`, `docs/CHARTE_GRAPHIQUE.md`, `assets/css/osme-tokens.css`.
- Polices Lexend et Source Sans 3 auto-hébergées dans `assets/fonts/` (copiées depuis `@fontsource-variable` par `npm run fonts`).
- Création du portail public dans `frontend/` (Astro, statique) :
  - accueil, indicateurs (vue d’ensemble, mortalité maternelle, mortalité périnatale), publications, à propos, mentions légales, protection des données, recherche Pagefind, 404 ;
  - cartes indicateurs, graphiques Chart.js 4 chargés à la visibilité avec configuration commune, étiquettes directes et tableau « Voir les données » ;
  - masquage des effectifs < 5 par zone de santé (double contrôle côté portail) ;
  - menu mobile sans JavaScript, aucune ressource externe, jetons `--osme-*` uniquement ;
  - testé sans débordement horizontal à 360, 390, 768, 1024 et 1366 px.
- Contrat des endpoints `api/public/*.php` documenté dans `docs/API_PUBLIQUE.md` (endpoints à écrire).
- `.gitattributes` (`eol=lf`) et `.gitignore` (secrets, archives, pièces privées, builds).
