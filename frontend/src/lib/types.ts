/**
 * Contrat des endpoints publics `api/public/*.php` (lecture seule, agrégats uniquement).
 * Documentation : docs/API_PUBLIQUE.md. Toute évolution se fait des deux côtés.
 */

export interface Period {
  /** Premier jour de la période, AAAA-MM-JJ. */
  start: string;
  /** Dernier jour de la période, AAAA-MM-JJ. */
  end: string;
}

export interface KpiValue {
  /** Valeur sur la période courante. */
  value: number;
  /** Même indicateur sur la période précédente de même durée (null si inconnu). */
  previous: number | null;
}

export interface MonthlyPoint {
  /** Mois, AAAA-MM. */
  month: string;
  maternal: number;
  /** Décès maternels du même mois, un an plus tôt. */
  maternal_previous: number | null;
  /** Mortinaissances. */
  stillbirths: number;
  /** Décès néonatals précoces (0 à 6 jours). */
  early_neonatal: number;
}

export interface CauseCount {
  label: string;
  count: number;
}

export interface ZoneRow {
  zone: string;
  /** null : cellule masquée côté serveur (moins de 5 cas). */
  maternal: number | null;
  perinatal: number | null;
}

export interface Indicators {
  /** Horodatage ISO 8601 de la production des agrégats. */
  generated_at: string;
  /** Libellé de la source affiché sous chaque graphique. */
  source: string;
  /** Territoire couvert, par exemple « province du Sud-Kivu ». */
  scope: string;
  period: Period;
  kpis: {
    maternal_deaths: KpiValue;
    perinatal_deaths: KpiValue;
    /** Part (0 à 100) des décès maternels ayant fait l'objet d'une revue. */
    maternal_reviewed_pct: KpiValue;
    /** Nombre de zones de santé ayant transmis des données sur la période. */
    reporting_zones: KpiValue;
  };
  monthly: MonthlyPoint[];
  maternal_causes: CauseCount[];
  by_zone: ZoneRow[];
}

export interface ApiPublication {
  slug: string;
  title: string;
  summary: string;
  /** AAAA-MM-JJ */
  published_at: string;
  category: string;
  /** HTML déjà assaini côté PHP (liste blanche de balises). */
  body_html: string;
}
