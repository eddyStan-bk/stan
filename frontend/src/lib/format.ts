/** Formatage des nombres et des dates selon la charte (français, espace insécable, virgule décimale). */

const intFormat = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });
const pctFormat = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 1 });

/** Seuil de masquage des petits effectifs sur le portail public (règle à valider par l'équipe épidémiologique). */
export const SMALL_CELL_THRESHOLD = 5;

export function formatInt(value: number): string {
  return intFormat.format(value);
}

export function formatPct(value: number): string {
  return `${pctFormat.format(value)} %`;
}

/**
 * Valeur d'une cellule « zone × période » : les effectifs de 1 à 4 ne sont jamais affichés,
 * même si le serveur les a laissés passer (double protection).
 */
export function formatCell(value: number | null): string {
  if (value === null) return `< ${SMALL_CELL_THRESHOLD}`;
  if (value > 0 && value < SMALL_CELL_THRESHOLD) return `< ${SMALL_CELL_THRESHOLD}`;
  return formatInt(value);
}

export function isMasked(value: number | null): boolean {
  return value === null || (value > 0 && value < SMALL_CELL_THRESHOLD);
}

function parseDay(iso: string): Date {
  // Midi UTC : évite tout décalage de jour lié au fuseau de la machine de build.
  return new Date(`${iso.slice(0, 10)}T12:00:00Z`);
}

/** « 2 octobre 2026 », « 1er octobre 2026 ». */
export function formatDate(iso: string): string {
  const date = parseDay(iso);
  const text = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
  return date.getUTCDate() === 1 ? text.replace(/^1 /, '1er ') : text;
}

export function formatMonthShort(month: string): string {
  return new Intl.DateTimeFormat('fr-FR', { month: 'short', year: '2-digit', timeZone: 'UTC' }).format(parseDay(`${month}-01`));
}

export function formatMonthLong(month: string): string {
  return new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(parseDay(`${month}-01`));
}

/** « octobre 2025 à septembre 2026 » */
export function formatPeriod(start: string, end: string): string {
  return `${formatMonthLong(start.slice(0, 7))} à ${formatMonthLong(end.slice(0, 7))}`;
}

export type Trend = 'up' | 'down' | 'stable';

export interface Variation {
  trend: Trend;
  /** Texte complet, toujours avec un mot : la couleur ne porte jamais seule l'information. */
  text: string;
}

/** Variation relative entre deux périodes, formulée sans dramatiser. */
export function variation(current: number, previous: number | null, unit: 'count' | 'points' = 'count'): Variation | null {
  if (previous === null) return null;
  if (unit === 'points') {
    const diff = current - previous;
    if (Math.abs(diff) < 0.5) return { trend: 'stable', text: 'stable par rapport à la période précédente' };
    const word = diff > 0 ? 'en hausse' : 'en baisse';
    return { trend: diff > 0 ? 'up' : 'down', text: `${word} de ${pctFormat.format(Math.abs(diff))} point${Math.abs(diff) >= 2 ? 's' : ''}` };
  }
  if (previous === 0) return null;
  const pct = ((current - previous) / previous) * 100;
  if (Math.abs(pct) < 1) return { trend: 'stable', text: 'stable par rapport à la période précédente' };
  const word = pct > 0 ? 'en hausse' : 'en baisse';
  return { trend: pct > 0 ? 'up' : 'down', text: `${word} de ${intFormat.format(Math.round(Math.abs(pct)))} % sur un an` };
}
