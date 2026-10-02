import { existsSync } from 'node:fs';
import { join } from 'node:path';

/** Navigation et liens du portail. Les routes /login, /dashboard, /pages/… restent servies par PHP. */

export const SITE_NAME = 'Observatoire de santé de la mère et de l’enfant';
export const SITE_SHORT = 'OSME';
export const SITE_DESCRIPTION =
  'Indicateurs agrégés de mortalité maternelle et périnatale en République démocratique du Congo, publiés par l’OSME avec l’ERSP-UCB et ses partenaires.';

export const LOGIN_URL = '/login';

/**
 * Symbole du logo (le logo complet, avec sa coquille « Chiid », est à redessiner en SVG).
 * Copier assets/images/logo/logo-mark.png dans frontend/public/assets/images/logo/ pour l'afficher ;
 * sans ce fichier, l'en-tête n'affiche que le nom en texte.
 */
export const LOGO_MARK_URL = '/assets/images/logo/logo-mark.png';
export const HAS_LOGO_MARK = existsSync(join(process.cwd(), 'public', LOGO_MARK_URL));

export const NAV = [
  { href: '/indicateurs/', label: 'Indicateurs' },
  { href: '/publications/', label: 'Publications' },
  { href: '/a-propos/', label: 'À propos' },
] as const;

export const PARTNERS = [
  {
    name: 'École régionale de santé publique — Université catholique de Bukavu',
    short: 'ERSP-UCB',
    role: 'Porteur scientifique',
  },
  { name: 'Caritas Congo', short: 'Caritas Congo', role: 'Partenaire de mise en œuvre' },
  { name: 'Coopération suisse', short: 'Coopération suisse', role: 'Partenaire financier' },
] as const;

/** Vrai si `href` correspond à la page courante ou à l'une de ses sous-pages. */
export function isCurrent(pathname: string, href: string): boolean {
  const path = pathname.endsWith('/') ? pathname : `${pathname}/`;
  return href === '/' ? path === '/' : path.startsWith(href);
}
