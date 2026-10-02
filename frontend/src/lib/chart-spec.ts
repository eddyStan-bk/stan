/**
 * Description sérialisable d'un graphique, produite au build et rendue côté client par lib/charts.ts.
 * Ce module n'importe pas Chart.js : il peut être utilisé dans le frontmatter des pages.
 */

/** Palette de séries de la charte (jetons --osme-dv-1 à --osme-dv-5). */
export type SeriesColor = 'dv-1' | 'dv-2' | 'dv-3' | 'dv-4' | 'dv-5';

export interface ChartSeries {
  label: string;
  data: (number | null)[];
  color: SeriesColor;
  /** Trait pointillé (période précédente, référence). */
  dashed?: boolean;
}

export interface ChartSpec {
  /** line : évolution ; bar : barres verticales ; hbar : barres horizontales (catégories longues). */
  kind: 'line' | 'bar' | 'hbar';
  labels: string[];
  series: ChartSeries[];
  /** Unité affichée dans les infobulles, au singulier et au pluriel (« décès »). */
  unit?: string;
}
