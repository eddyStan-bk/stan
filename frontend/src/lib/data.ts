/**
 * Chargement des données publiques au moment du build.
 *
 * - OSME_API_URL (ex. https://osm.erspdrc.com) : lit les endpoints `api/public/*.php`.
 * - OSME_API_REQUIRED=1 : fait échouer le build si l'API ne répond pas (à utiliser avant un déploiement).
 * - OSME_DEMO_DATA=1 : utilise des données fictives, signalées par un bandeau sur chaque page.
 *   Ne jamais déployer un build de démonstration en production.
 *
 * Sans aucune de ces variables, le portail se construit sans indicateurs (états vides).
 */
import { z } from 'astro/zod';
import demo from '../data/demo-indicators.json';
import type { ApiPublication, Indicators } from './types';

const env = process.env;

export const isDemo = env.OSME_DEMO_DATA === '1';
const apiBase = (env.OSME_API_URL ?? '').replace(/\/+$/, '');
const apiRequired = env.OSME_API_REQUIRED === '1';

const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const count = z.number().int().min(0);
const kpi = z.object({ value: z.number().min(0), previous: z.number().min(0).nullable() });

const indicatorsSchema = z.object({
  generated_at: z.string().min(10),
  source: z.string().min(1),
  scope: z.string().min(1),
  period: z.object({ start: day, end: day }),
  kpis: z.object({
    maternal_deaths: kpi,
    perinatal_deaths: kpi,
    maternal_reviewed_pct: kpi,
    reporting_zones: kpi,
  }),
  monthly: z.array(
    z.object({
      month: z.string().regex(/^\d{4}-\d{2}$/),
      maternal: count,
      maternal_previous: count.nullable(),
      stillbirths: count,
      early_neonatal: count,
    }),
  ),
  maternal_causes: z.array(z.object({ label: z.string().min(1), count })),
  by_zone: z.array(z.object({ zone: z.string().min(1), maternal: count.nullable(), perinatal: count.nullable() })),
});

const publicationsSchema = z.array(
  z.object({
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: z.string().min(1),
    summary: z.string(),
    published_at: day,
    category: z.string().min(1),
    body_html: z.string(),
  }),
);

async function fetchJson(path: string): Promise<unknown> {
  const response = await fetch(`${apiBase}${path}`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} sur ${path}`);
  return response.json();
}

function fail(what: string, error: unknown): null {
  const message = `[OSME][portail] ${what} indisponible : ${error instanceof Error ? error.message : String(error)}`;
  if (apiRequired) throw new Error(message);
  console.warn(message);
  return null;
}

let indicatorsPromise: Promise<Indicators | null> | undefined;

/** Agrégats publics, ou null s'ils ne sont pas disponibles. Mis en cache pour tout le build. */
export function loadIndicators(): Promise<Indicators | null> {
  indicatorsPromise ??= (async () => {
    if (isDemo) return indicatorsSchema.parse(demo) as Indicators;
    if (!apiBase) return null;
    try {
      return indicatorsSchema.parse(await fetchJson('/api/public/indicators.php')) as Indicators;
    } catch (error) {
      return fail('Indicateurs', error);
    }
  })();
  return indicatorsPromise;
}

/** Publications gérées dans l'administration PHP (vide sans API). */
export async function loadApiPublications(): Promise<ApiPublication[]> {
  if (!apiBase || isDemo) return [];
  try {
    return publicationsSchema.parse(await fetchJson('/api/public/publications.php'));
  } catch (error) {
    fail('Publications', error);
    return [];
  }
}
