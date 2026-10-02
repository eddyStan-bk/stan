/**
 * Mise en forme des agrégats pour les pages : cartes KPI, graphiques et tableaux équivalents.
 * Une seule source pour l'accueil et les pages d'indicateurs.
 */
import type { ChartSpec } from './chart-spec';
import { formatCell, formatDate, formatInt, formatMonthLong, formatMonthShort, formatPct, formatPeriod, variation } from './format';
import type { Indicators } from './types';

export function periodLabel(data: Indicators): string {
  return formatPeriod(data.period.start, data.period.end);
}

export function updatedLabel(data: Indicators): string {
  return formatDate(data.generated_at);
}

export function kpis(data: Indicators) {
  const period = periodLabel(data);
  const { maternal_deaths, perinatal_deaths, maternal_reviewed_pct, reporting_zones } = data.kpis;
  return [
    {
      id: 'maternal' as const,
      label: 'Décès maternels notifiés',
      value: formatInt(maternal_deaths.value),
      period,
      source: data.source,
      variation: variation(maternal_deaths.value, maternal_deaths.previous),
      icon: 'person-heart',
      accent: 'violet' as const,
    },
    {
      id: 'perinatal' as const,
      label: 'Décès périnatals notifiés',
      value: formatInt(perinatal_deaths.value),
      period,
      source: data.source,
      variation: variation(perinatal_deaths.value, perinatal_deaths.previous),
      icon: 'heart-pulse',
      accent: 'sarcelle' as const,
    },
    {
      id: 'reviewed' as const,
      label: 'Décès maternels revus en comité',
      value: formatPct(maternal_reviewed_pct.value),
      period,
      source: data.source,
      variation: variation(maternal_reviewed_pct.value, maternal_reviewed_pct.previous, 'points'),
      icon: 'clipboard2-check',
      accent: 'violet' as const,
    },
    {
      id: 'zones' as const,
      label: 'Zones de santé participantes',
      value: formatInt(reporting_zones.value),
      unit: reporting_zones.value > 1 ? 'zones' : 'zone',
      period,
      source: data.source,
      variation:
        reporting_zones.previous === null
          ? null
          : {
              trend: reporting_zones.value === reporting_zones.previous ? ('stable' as const) : reporting_zones.value > reporting_zones.previous ? ('up' as const) : ('down' as const),
              text: `${formatInt(reporting_zones.previous)} sur la période précédente`,
            },
      icon: 'geo-alt',
      accent: 'violet' as const,
    },
  ];
}

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

export function maternalTrend(data: Indicators) {
  const months = data.monthly;
  const current = sum(months.map((m) => m.maternal));
  const hasPrevious = months.every((m) => m.maternal_previous !== null);
  const previous = hasPrevious ? sum(months.map((m) => m.maternal_previous ?? 0)) : null;
  const change = variation(current, previous);

  const spec: ChartSpec = {
    kind: 'line',
    labels: months.map((m) => formatMonthShort(m.month)),
    unit: 'décès',
    series: [
      { label: 'Cette année', data: months.map((m) => m.maternal), color: 'dv-1' },
      ...(hasPrevious ? [{ label: 'Un an plus tôt', data: months.map((m) => m.maternal_previous), color: 'dv-2' as const, dashed: true }] : []),
    ],
  };

  return {
    question: 'Les décès maternels notifiés baissent-ils d’une année sur l’autre ?',
    summary: change
      ? `${formatInt(current)} décès maternels notifiés de ${periodLabel(data)} (${data.scope}), ${change.text}.`
      : `${formatInt(current)} décès maternels notifiés de ${periodLabel(data)} (${data.scope}).`,
    spec,
    table: {
      columns: [{ label: 'Mois' }, { label: 'Décès maternels', numeric: true }, ...(hasPrevious ? [{ label: 'Un an plus tôt', numeric: true }] : [])],
      rows: months.map((m) => [
        formatMonthLong(m.month),
        formatInt(m.maternal),
        ...(hasPrevious ? [m.maternal_previous === null ? '—' : formatInt(m.maternal_previous)] : []),
      ]),
    },
  };
}

export function maternalCauses(data: Indicators) {
  // Par effectif décroissant, la catégorie « Autres… » toujours en dernier (charte).
  const isOther = (label: string) => /^autres?\b/i.test(label);
  const causes = [...data.maternal_causes].sort((a, b) => Number(isOther(a.label)) - Number(isOther(b.label)) || b.count - a.count);
  const total = sum(causes.map((c) => c.count));
  const first = causes.find((c) => !isOther(c.label));
  const spec: ChartSpec = {
    kind: 'hbar',
    labels: causes.map((c) => c.label),
    unit: 'décès',
    series: [{ label: 'Décès maternels', data: causes.map((c) => c.count), color: 'dv-1' }],
  };
  return {
    question: 'De quoi meurent les femmes pendant la grossesse et après l’accouchement ?',
    summary: first && total > 0
      ? `${first.label} : première cause, ${formatPct((first.count / total) * 100)} des décès maternels dont la cause est établie.`
      : 'Causes des décès maternels revus.',
    spec,
    table: {
      columns: [{ label: 'Cause' }, { label: 'Décès', numeric: true }, { label: 'Part', numeric: true }],
      rows: causes.map((c) => [c.label, formatInt(c.count), total > 0 ? formatPct((c.count / total) * 100) : '—']),
    },
  };
}

export function perinatalTrend(data: Indicators) {
  const months = data.monthly;
  const stillbirths = sum(months.map((m) => m.stillbirths));
  const neonatal = sum(months.map((m) => m.early_neonatal));
  const spec: ChartSpec = {
    kind: 'line',
    labels: months.map((m) => formatMonthShort(m.month)),
    unit: 'décès',
    series: [
      { label: 'Mortinaissances', data: months.map((m) => m.stillbirths), color: 'dv-4' },
      { label: 'Néonatals précoces', data: months.map((m) => m.early_neonatal), color: 'dv-3' },
    ],
  };
  return {
    question: 'Comment évoluent les décès périnatals, mois par mois ?',
    summary: `${formatInt(stillbirths)} mortinaissances et ${formatInt(neonatal)} décès néonatals précoces notifiés de ${periodLabel(data)}.`,
    spec,
    table: {
      columns: [{ label: 'Mois' }, { label: 'Mortinaissances', numeric: true }, { label: 'Décès néonatals précoces', numeric: true }, { label: 'Total', numeric: true }],
      rows: months.map((m) => [formatMonthLong(m.month), formatInt(m.stillbirths), formatInt(m.early_neonatal), formatInt(m.stillbirths + m.early_neonatal)]),
    },
  };
}

/** Lignes du tableau par zone de santé, petits effectifs masqués. */
export function zoneRows(data: Indicators) {
  return [...data.by_zone]
    .sort((a, b) => a.zone.localeCompare(b.zone, 'fr'))
    .map((row) => ({ zone: row.zone, maternal: formatCell(row.maternal), perinatal: formatCell(row.perinatal) }));
}
