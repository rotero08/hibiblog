// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mdx from '@astrojs/mdx';
import node from '@astrojs/node';
import AutoImport from 'astro-auto-import';
import mdxComponentDocs from './integrations/mdx-component-docs.mjs';

const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@300;400;600&family=Lora:ital,wght@0,400;0,500;0,600;1,400;1,600&family=Inter:wght@300;400;500&family=JetBrains+Mono:wght@400;500&display=swap';

/**
 * Components exposed globally to every MDX guide. Listing them here means the
 * documentation files never need manual `import` statements — keeping them as
 * clean Markdown + component tags, ready to be mapped to CMS blocks later.
 *
 * NOTE: `astro-auto-import` must be registered BEFORE `@astrojs/mdx`, and it
 * only injects into `.mdx` files (not `.md`).
 */
const AUTO_IMPORTED_COMPONENTS = [
  './src/components/KippuTicket.astro',
  './src/components/VocabFeature.astro',
  './src/components/HankoSeal.astro',
  './src/components/AccordionFAQ.astro',
  './src/components/JournalHeader.astro',
  './src/components/Philosophy.astro',
  './src/components/InfoList.astro',
  './src/components/Colombia.astro',
  './src/components/Creditos.astro',
  './src/components/Frases.astro',
  './src/components/Figura.astro',
  './src/components/Encuesta.astro',
];

// https://astro.build/config
export default defineConfig({
  // Update to the deployed origin; used for sitemap + canonical URLs.
  site: 'https://hibi-blog.delfost.workers.dev',
  // "static" + a server adapter is the modern replacement for the removed
  // `output: 'hybrid'`: everything is prerendered by default, while any route
  // can opt into on-demand SSR later via `export const prerender = false`.
  output: 'static',
  adapter: node({ mode: 'standalone' }),
  // Let the dev server answer when opened by this machine's Tailscale name
  // (by IP it always works; start it with `pnpm dev --host`).
  vite: { server: { allowedHosts: ['nobara-pc', '.ts.net'] } },

  integrations: [
    AutoImport({ imports: AUTO_IMPORTED_COMPONENTS }),
    // For the editor: hovering one of those tags in an .mdx file shows what the
    // component does and the props it takes, read from the component's comments.
    mdxComponentDocs({ components: AUTO_IMPORTED_COMPONENTS }),

    starlight({
      title: '日々 · Hibi',
      description: 'Guías de japonés y vida en Japón.',
      // src/pages/404.astro (the level-crossing page) replaces Starlight's own.
      disable404Route: true,
      defaultLocale: 'root',
      locales: {
        root: { label: 'Español', lang: 'es' },
      },
      // Match the legacy look on documentation pages: the original top nav
      // (with Starlight search) replaces Starlight's header; the LEFT sidebar
      // is the page navigation rendered with the legacy travel-journal checkbox
      // design; the RIGHT on-page TOC stays Starlight's native default.
      components: {
        Header: './src/components/starlight/Header.astro',
        Sidebar: './src/components/starlight/Sidebar.astro',
        // Keep prev/next within the current guide (see Pagination.astro) so the
        // guides stay entirely separate — no cross-guide "previous page".
        Pagination: './src/components/starlight/Pagination.astro',
        // The chapter title, with its station tag and stamp status.
        PageTitle: './src/components/starlight/PageTitle.astro',
      },
      // The custom theme, fonts and colours are inherited by the docs.
      customCss: ['./src/styles/global.css', './src/styles/fx.css'],
      // Load the brand fonts and the ambient leaves canvas on docs pages too.
      head: [
        { tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.googleapis.com' } },
        {
          tag: 'link',
          attrs: { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true },
        },
        { tag: 'link', attrs: { rel: 'stylesheet', href: FONT_HREF } },
        // The feed of every post (src/pages/rss.xml.ts), found by feed readers on the guides too.
        { tag: 'link', attrs: { rel: 'alternate', type: 'application/rss+xml', title: '日々 · Hibi', href: '/rss.xml' } },
        { tag: 'script', attrs: { src: '/scripts/leaves.js', defer: true } },
        { tag: 'script', attrs: { src: '/scripts/hibi.js', defer: true } },
      ],
      // Built-in search (Pagefind) and the per-page table of contents are on by
      // default; `tableOfContents` is set explicitly for clarity.
      tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
      // NOTE: the left pane is fully rendered by the custom Sidebar override
      // (src/components/starlight/Sidebar.astro): it shows only the current
      // guide's section, derives "Inicio" (the guide landing) from the URL, and
      // adds the "Volver" link. This config supplies the labels/slugs/order.
      sidebar: [
        {
          label: 'Guía de Japonés',
          items: [
            { label: 'Introducción', slug: 'guias/japones' },
            { label: 'Fundamentos y escritura', slug: 'guias/japones/fundamentos' },
            { label: 'Gramática base', slug: 'guias/japones/gramatica' },
            { label: 'Vocabulario y Anki', slug: 'guias/japones/vocabulario' },
            { label: 'Inmersión y listening', slug: 'guias/japones/inmersion' },
            { label: 'Hablar y producción', slug: 'guias/japones/hablar' },
            { label: 'JLPT y exámenes', slug: 'guias/japones/jlpt' },
            { label: 'Preguntas frecuentes', slug: 'guias/japones/faq' },
          ],
        },
        {
          label: 'Guía de Llegada',
          items: [
            { label: 'Introducción', slug: 'guias/llegada' },
            { label: 'Visa y CoE', slug: 'guias/llegada/visa' },
            { label: 'Antes de salir', slug: 'guias/llegada/preparacion' },
            { label: 'El día de la llegada', slug: 'guias/llegada/aduana' },
            { label: 'Trámites en el ayuntamiento', slug: 'guias/llegada/tramites' },
            { label: 'Teléfono, sello y banco', slug: 'guias/llegada/telefono-banco' },
            { label: 'Pagar sin efectivo', slug: 'guias/llegada/pagos' },
            { label: 'El día a día', slug: 'guias/llegada/dia-a-dia' },
            { label: 'Vivienda', slug: 'guias/llegada/vivienda' },
            { label: 'Transporte', slug: 'guias/llegada/transporte' },
            { label: 'Salud', slug: 'guias/llegada/salud' },
            { label: 'Comida y religión', slug: 'guias/llegada/comida' },
            { label: 'Compras', slug: 'guias/llegada/compras' },
            { label: 'Ocio y viajes', slug: 'guias/llegada/ocio' },
            { label: 'Trabajo y costos', slug: 'guias/llegada/trabajo' },
            { label: 'Salir de Japón', slug: 'guias/llegada/regreso' },
          ],
        },
      ],
    }),

    mdx(),
  ],
});
