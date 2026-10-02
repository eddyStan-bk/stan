/**
 * Configuration Chart.js 4 commune à tout le portail (charte : une seule configuration partagée).
 * Chargé à la demande, uniquement quand un graphique devient visible.
 */
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
  type ChartConfiguration,
  type Plugin,
} from 'chart.js';
import type { ChartSpec } from './chart-spec';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, LineController, LineElement, PointElement, Tooltip);

const numberFormat = new Intl.NumberFormat('fr-FR');

function token(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(`--osme-${name}`).trim();
}

/** Étiquettes directes : nom de la série au bout de chaque courbe, valeur au bout de chaque barre horizontale. */
const directLabels: Plugin = {
  id: 'osmeDirectLabels',
  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    const type = (chart.config as ChartConfiguration).type;
    const horizontal = chart.options.indexAxis === 'y';
    ctx.save();
    ctx.textBaseline = 'middle';

    if (type === 'line') {
      ctx.font = `600 14px ${token('font-sans')}`;
      ctx.textAlign = 'left';
      const placed: number[] = [];
      chart.data.datasets.forEach((dataset, index) => {
        const meta = chart.getDatasetMeta(index);
        if (meta.hidden) return;
        const points = meta.data;
        let last = points.length - 1;
        while (last >= 0 && (dataset.data[last] === null || dataset.data[last] === undefined)) last -= 1;
        if (last < 0) return;
        const point = points[last];
        let y = point.y;
        // Écarte les étiquettes qui se chevauchent.
        for (const other of placed) {
          if (Math.abs(other - y) < 16) y = other + (y >= other ? 16 : -16);
        }
        placed.push(y);
        ctx.fillStyle = String(dataset.borderColor);
        ctx.fillText(dataset.label ?? '', point.x + 8, y);
      });
    } else if (horizontal) {
      ctx.font = `600 14px ${token('font-sans')}`;
      ctx.fillStyle = token('ink');
      ctx.textAlign = 'left';
      chart.getDatasetMeta(0).data.forEach((bar, i) => {
        const value = chart.data.datasets[0].data[i];
        if (typeof value === 'number') ctx.fillText(numberFormat.format(value), bar.x + 6, bar.y);
      });
    }
    ctx.restore();
  },
};

/** Coupe un libellé long en deux lignes (graphiques étroits). */
function wrap(label: string, max: number): string | string[] {
  if (label.length <= max) return label;
  const middle = label.length / 2;
  let cut = -1;
  for (let i = 0; i < label.length; i += 1) {
    if (label[i] === ' ' && (cut < 0 || Math.abs(i - middle) < Math.abs(cut - middle))) cut = i;
  }
  return cut < 0 ? label : [label.slice(0, cut), label.slice(cut + 1)];
}

function measure(labels: string[], font: string): number {
  const ctx = document.createElement('canvas').getContext('2d');
  if (!ctx) return 0;
  ctx.font = font;
  return Math.max(0, ...labels.map((label) => ctx.measureText(label).width));
}

export async function renderChart(canvas: HTMLCanvasElement): Promise<void> {
  const raw = canvas.dataset.osmeChart;
  if (!raw) return;
  const spec = JSON.parse(raw) as ChartSpec;

  await document.fonts?.ready;

  const sans = token('font-sans');
  const ink = token('ink');
  const muted = token('ink-muted');
  const line = token('line');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  Chart.defaults.font.family = sans;
  Chart.defaults.font.size = 13;
  Chart.defaults.color = muted;

  const horizontal = spec.kind === 'hbar';
  const isLine = spec.kind === 'line';
  const labelFont = `600 14px ${sans}`;
  const rightPadding = isLine
    ? measure(spec.series.map((s) => s.label), labelFont) + 16
    : horizontal
      ? measure(spec.series[0]?.data.map((v) => (v === null ? '' : numberFormat.format(v))) ?? [], labelFont) + 12
      : 0;

  const datasets = spec.series.map((series) => {
    const color = token(series.color);
    return {
      label: series.label,
      data: series.data,
      borderColor: color,
      // Barres : la catégorie « Autres… » passe en line-input (charte, palette de séries).
      backgroundColor: isLine ? color : spec.labels.map((label) => (/^autres?\b/i.test(label) ? token('line-input') : color)),
      borderWidth: isLine ? 2.5 : 0,
      borderDash: series.dashed ? [6, 4] : undefined,
      pointRadius: isLine ? 3 : undefined,
      pointHoverRadius: isLine ? 5 : undefined,
      tension: 0,
      spanGaps: false,
      borderRadius: isLine ? undefined : 4,
      maxBarThickness: 36,
    };
  });

  const unit = spec.unit ? ` ${spec.unit}` : '';
  const valueAxis = {
    beginAtZero: true,
    grid: { color: line, drawTicks: false },
    border: { display: false },
    ticks: { padding: 8, precision: 0, callback: (value: string | number) => numberFormat.format(Number(value)) },
  };
  const categoryAxis = {
    grid: { display: false },
    border: { color: line },
    ticks: { padding: 6, color: horizontal ? ink : muted, autoSkip: !horizontal, maxRotation: 0 },
  };

  new Chart(canvas, {
    type: isLine ? 'line' : 'bar',
    data: {
      labels: horizontal && canvas.clientWidth < 520 ? spec.labels.map((label) => wrap(label, 16)) : spec.labels,
      datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: reduceMotion ? false : { duration: 400 },
      indexAxis: horizontal ? 'y' : 'x',
      interaction: { mode: isLine ? 'index' : 'nearest', intersect: false },
      layout: { padding: { top: 8, right: rightPadding } },
      scales: horizontal ? { x: valueAxis, y: categoryAxis } : { x: categoryAxis, y: valueAxis },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: token('surface-raised'),
          titleColor: ink,
          bodyColor: ink,
          borderColor: line,
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          boxPadding: 4,
          titleFont: { family: sans, weight: 600, size: 14 },
          bodyFont: { family: sans, size: 14 },
          callbacks: {
            label: (item) => {
              const value = item.parsed[horizontal ? 'x' : 'y'];
              const text = value === null ? 'non disponible' : `${numberFormat.format(value)}${unit}`;
              return spec.series.length > 1 ? `${item.dataset.label} : ${text}` : text;
            },
          },
        },
      },
    },
    plugins: [directLabels],
  });
}
