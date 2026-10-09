import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

/**
 * A post: one Markdown or MDX file. This is everything its header can say.
 * The address comes from the file name, the reading time from the text.
 *
 *   ---
 *   title: Tomar el shinkansen por primera vez
 *   description: Una o dos frases. Salen en las tarjetas y bajo el título.
 *   date: 2026-03-14
 *   tag: Transporte
 *   ---
 */
const post = z.object({
  title: z.string(),
  /** One or two sentences: the summary on cards, under the title and for search engines. */
  description: z.string(),
  /** Day it was written, as YYYY-MM-DD. Posts are listed newest first. */
  date: z.coerce.date(),
  /** Short label on the card, such as "Crónica" or "Comida". */
  tag: z.string().optional(),
  /** Mini blog of the Japanese section the note belongs to (a slug from src/data/topics.ts). */
  topic: z.string().optional(),
  /** A Japanese subtitle under the title. */
  ja: z.string().optional(),
  /** A draft shows while developing (`pnpm dev`) and is left out of the built site. */
  draft: z.boolean().default(false),
});

/** Every .md / .mdx file in a folder is a post. Names starting with "_" are skipped. */
const posts = (folder: string) =>
  defineCollection({
    loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: `./src/content/${folder}` }),
    schema: post,
  });

export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
  // src/content/blog/      →  /blog/<file name>/
  blog: posts('blog'),
  // src/content/personal/  →  /personal/<file name>/
  personal: posts('personal'),
  // src/content/japones/  →  /japones/<file name>/   (short notes on grammar, words and kanji)
  japones: posts('japones'),
};
