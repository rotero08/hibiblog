/**
 * RSS feeds: one with every post of the site, and one for each shelf.
 *
 *   /rss.xml            everything, newest first
 *   /blog/rss.xml       El Blog de Japón
 *   /personal/rss.xml   Reflexiones Personales
 *   /japones/rss.xml    Notas de japonés
 *
 * The titles come from SHELVES and the items from getPosts, so a new post is in
 * the feeds as soon as its file exists. Drafts are never in a feed. Items carry
 * the title, the description and a link; the text is read on the site.
 */
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SHELVES, getPosts, postHref, type Shelf } from './posts';

const SITE_TITLE = '日々 · Hibi';

interface Feed {
  /** Where the feed is served. */
  href: string;
  title: string;
  description: string;
  /** The shelves whose posts it lists. */
  shelves: Shelf[];
}

const shelfFeed = (shelf: Shelf): Feed => ({
  href: `/${shelf}/rss.xml`,
  title: `${SHELVES[shelf].title} · Hibi`,
  description: `Publicaciones de «${SHELVES[shelf].title}» en Hibi.`,
  shelves: [shelf],
});

/** Every feed, by name. Adding a shelf to SHELVES makes this fail to compile until it has one. */
export const FEEDS: Record<'all' | Shelf, Feed> = {
  all: {
    href: '/rss.xml',
    title: SITE_TITLE,
    description: 'Notas de japonés, crónicas y reflexiones sobre la vida en Japón, en español.',
    shelves: Object.keys(SHELVES) as Shelf[],
  },
  blog: shelfFeed('blog'),
  personal: shelfFeed('personal'),
  japones: shelfFeed('japones'),
};

/** The route handler of a feed: `export const GET = feedRoute('blog');` */
export const feedRoute = (key: keyof typeof FEEDS) => async (context: APIContext) => {
  const { title, description, href, shelves } = FEEDS[key];
  const posts = (await Promise.all(shelves.map((shelf) => getPosts(shelf))))
    .flat()
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return rss({
    title,
    description,
    site: context.site!,
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
    customData: [
      '<language>es</language>',
      `<atom:link href="${new URL(href, context.site)}" rel="self" type="application/rss+xml" />`,
    ].join(''),
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: postHref(post),
      categories: [post.data.tag ?? SHELVES[post.collection].tag],
    })),
  });
};
