// @ts-check
import { defineConfig } from 'astro/config';

// Portail public OSME : site statique, compilé avant déploiement (pas de Node en production).
// Les routes réservées à l'application PHP (/login, /dashboard, /pages/…, /api/…, /storage/…,
// /uploads/…) ne doivent jamais être générées ici.
export default defineConfig({
  site: 'https://osm.erspdrc.com',
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
    // Évite toute collision avec d'éventuels dossiers PHP existants à la racine publique.
    assets: '_portail',
  },
  // Aucun script de préchargement ni ressource externe.
  prefetch: false,
  devToolbar: { enabled: false },
  server: { port: 4321 },
  vite: {
    server: {
      // Les jetons et les polices sont la source unique dans ../assets : Vite doit pouvoir les lire.
      fs: { allow: ['..'] },
    },
  },
});
