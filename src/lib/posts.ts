/**
 * Posts: the shelves of the site that are written as plain Markdown / MDX
 * files (see src/content.config.ts for what a post's header can say).
 *
 *   src/content/blog/       El Blog de Japón          /blog/<file>/
 *   src/content/personal/   Reflexiones Personales    /personal/<file>/
 *   src/content/japones/    Notas de japonés          /japones/<file>/
 *
 * Pages and cards never read the files themselves: they ask here.
 */
import { getCollection, type CollectionEntry } from 'astro:content';

export type Shelf = 'blog' | 'personal' | 'japones';
export type Post = CollectionEntry<Shelf>;

/** What changes from one shelf to the other. */
export const SHELVES = {
  blog: {
    title: 'El Blog de Japón',
    ja: '日本ブログ',
    /** Printed on the postmark of each post: 日記, a diary. */
    mark: '日記',
    color: 'var(--green)',
    /** Label used when a post has no `tag`. */
    tag: 'Blog',
    read: 'Leer entrada',
    newer: 'Entrada siguiente',
    older: 'Entrada anterior',
    all: 'Todas las entradas',
    empty: 'Todavía no hay entradas publicadas.',
  },
  personal: {
    title: 'Reflexiones Personales',
    ja: '個人的な記録',
    /** 手記, a personal note. */
    mark: '手記',
    color: 'var(--brown)',
    tag: 'Personal',
    read: 'Leer ensayo',
    newer: 'Ensayo siguiente',
    older: 'Ensayo anterior',
    all: 'Todos los ensayos',
    empty: 'Todavía no hay ensayos publicados.',
  },
  japones: {
    title: 'Notas de japonés',
    ja: '日本語メモ',
    /** メモ, a memo: a short note. */
    mark: 'メモ',
    color: 'var(--stamp)',
    tag: 'Nota',
    read: 'Leer nota',
    newer: 'Nota siguiente',
    older: 'Nota anterior',
    all: 'Todas las notas',
    empty: 'Todavía no hay notas publicadas.',
  },
} as const;

/**
 * The posts of a shelf, newest first. Drafts (`draft: true`) are included while
 * developing and left out of the built site. `topic` keeps one mini blog only.
 */
export async function getPosts(shelf: Shelf, topic?: string): Promise<Post[]> {
  const posts = await getCollection(
    shelf,
    ({ data }) => (import.meta.env.DEV || !data.draft) && (!topic || data.topic === topic),
  );
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export const postHref = (post: Post) => `/${post.collection}/${post.id}/`;

/** Minutes it takes to read, at about 200 words a minute. 0 when there is no text yet. */
export function readingMinutes(post: Post): number {
  const words = (post.body ?? '')
    .replace(/^(import|export) .*$/gm, ' ') // MDX imports
    .replace(/<[^>]*>/g, ' ') // component tags
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1') // links and images keep their text
    .split(/\s+/)
    .filter((word) => /[\p{L}\p{N}]/u.test(word)).length;
  return words === 0 ? 0 : Math.max(1, Math.round(words / 200));
}

/** The start of the post's own text, for cards: plain words, cut at about `max` characters. */
export function excerpt(post: Post, max = 150): string {
  const text = (post.body ?? '')
    .replace(/^(import|export) .*$/gm, ' ')
    .replace(/^#+ .*$/gm, ' ') // headings
    .replace(/<[^>]*>/g, ' ')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s*[-*] /gm, '')
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= max) return text;
  return text.slice(0, text.lastIndexOf(' ', max)).replace(/[,.;:]$/, '') + '…';
}

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const two = (n: number) => String(n).padStart(2, '0');
// A date in a post's header has no time zone; reading it as UTC keeps the day as written.
const parts = (date: Date) => ({ y: date.getUTCFullYear(), m: date.getUTCMonth(), d: date.getUTCDate() });

/** "Mayo 2026", for cards. */
export function monthYear(date: Date): string {
  const { y, m } = parts(date);
  return `${MONTHS[m][0].toUpperCase()}${MONTHS[m].slice(1)} ${y}`;
}
/** "12 de mayo de 2026", for the post itself. */
export function longDate(date: Date): string {
  const { y, m, d } = parts(date);
  return `${d} de ${MONTHS[m]} de ${y}`;
}
/** "2026.05.12", as dates are written on stamps. */
export function stampDate(date: Date): string {
  const { y, m, d } = parts(date);
  return `${y}.${two(m + 1)}.${two(d)}`;
}
/** "2026-05-12", for <time datetime>. */
export function isoDate(date: Date): string {
  const { y, m, d } = parts(date);
  return `${y}-${two(m + 1)}-${two(d)}`;
}

/** "5 min", or nothing for a post without text. */
export function readingLabel(post: Post): string {
  const minutes = readingMinutes(post);
  return minutes ? `${minutes} min` : '';
}
