// Copie les polices variables (sous-ensemble latin, accents français compris) depuis
// @fontsource-variable vers ../assets/fonts, source unique partagée avec l'application PHP.
// À relancer après une mise à jour des paquets de polices : `npm run fonts`.
import { copyFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const target = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'assets', 'fonts');
mkdirSync(target, { recursive: true });

const fonts = [
  ['@fontsource-variable/lexend', 'lexend-latin-wght-normal.woff2', 'lexend-latin-variable.woff2'],
  ['@fontsource-variable/source-sans-3', 'source-sans-3-latin-wght-normal.woff2', 'source-sans-3-latin-variable.woff2'],
];

for (const [pkg, file, dest] of fonts) {
  const dir = dirname(require.resolve(`${pkg}/package.json`));
  copyFileSync(join(dir, 'files', file), join(target, dest));
  // Licence SIL OFL : doit accompagner les fichiers de police.
  copyFileSync(join(dir, 'LICENSE'), join(target, `LICENSE-${dest.replace(/-latin-variable\.woff2$/, '')}.txt`));
  console.log(`${pkg} → assets/fonts/${dest}`);
}
