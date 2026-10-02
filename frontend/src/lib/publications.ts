/** Fusion des publications Markdown (dépôt) et des publications de l'administration PHP (API). */
import { getCollection, render, type CollectionEntry } from 'astro:content';
import { loadApiPublications } from './data';

export interface PublicationItem {
  slug: string;
  title: string;
  summary: string;
  /** AAAA-MM-JJ */
  date: string;
  category: string;
  source: 'markdown' | 'api';
  entry?: CollectionEntry<'publications'>;
  html?: string;
}

/** Publications publiées, de la plus récente à la plus ancienne. Le Markdown l'emporte en cas de doublon de slug. */
export async function getPublications(): Promise<PublicationItem[]> {
  const entries = await getCollection('publications', ({ data }) => !data.draft);
  const items: PublicationItem[] = entries.map((entry) => ({
    slug: entry.id,
    title: entry.data.title,
    summary: entry.data.summary,
    date: entry.data.published_at.toISOString().slice(0, 10),
    category: entry.data.category,
    source: 'markdown',
    entry,
  }));

  const known = new Set(items.map((item) => item.slug));
  for (const pub of await loadApiPublications()) {
    if (known.has(pub.slug)) continue;
    items.push({
      slug: pub.slug,
      title: pub.title,
      summary: pub.summary,
      date: pub.published_at,
      category: pub.category,
      source: 'api',
      html: pub.body_html,
    });
  }

  return items.sort((a, b) => b.date.localeCompare(a.date));
}

export { render };
