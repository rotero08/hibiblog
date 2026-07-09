// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mdx from '@astrojs/mdx';
import node from '@astrojs/node';
import AutoImport from 'astro-auto-import';

const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@300;400;600&family=Lora:ital,wght@0,400;0,500;1,400&family=Inter:wght@300;400;500&family=JetBrains+Mono:wght@400&display=swap';

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
];

// https://astro.build/config
export default defineConfig({
  // Update to the deployed origin; used for sitemap + canonical URLs.
  site: 'https://hibi.example.com',
  // "static" + a server adapter is the modern replacement for the removed
  // `output: 'hybrid'`: everything is prerendered by default, while any route
  // can opt into on-demand SSR later via `export const prerender = false`.
  output: 'static',
  adapter: node({ mode: 'standalone' }),

  integrations: [
    AutoImport({ imports: AUTO_IMPORTED_COMPONENTS }),

    starlight({
      title: '日々 — Hibi',
      description: 'Guías de japonés y vida en Japón.',
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
      },
      // The custom theme, fonts and colours are inherited by the docs.
      customCss: ['./src/styles/global.css'],
      // Load the brand fonts and the ambient leaves canvas on docs pages too.
      head: [
        { tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.googleapis.com' } },
        {
          tag: 'link',
          attrs: { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true },
        },
        { tag: 'link', attrs: { rel: 'stylesheet', href: FONT_HREF } },
        { tag: 'script', attrs: { src: '/scripts/leaves.js', defer: true } },
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
            { label: 'Preparación y vuelo', slug: 'guias/llegada/preparacion' },
            { label: 'Aduana e inmigración', slug: 'guias/llegada/aduana' },
            { label: 'Traslado a la metrópolis', slug: 'guias/llegada/traslado' },
            { label: 'Asentamiento y trámites', slug: 'guias/llegada/tramites' },
          ],
        },
      ],
    }),

    mdx(),
  ],
});
