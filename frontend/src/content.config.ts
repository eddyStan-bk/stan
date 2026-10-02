import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Publications rédigées dans le dépôt (Markdown). Les publications gérées dans l'administration PHP
 * sont lues au build par lib/data.ts (loadApiPublications) et fusionnées dans les pages.
 */
const publications = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/publications' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    published_at: z.coerce.date(),
    category: z.enum(['Méthodologie', 'Rapport', 'Bulletin', 'Actualité']),
    draft: z.boolean().default(false),
  }),
});

export const collections = { publications };
