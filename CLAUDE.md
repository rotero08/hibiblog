# Hibi (日々)

Spanish-language blog and guides about Japanese and life in Japan, for Colombian readers. Astro 6 + Starlight + MDX, static output with the Node adapter. Package name `hibi-blog`.

## Commands

- `pnpm build` and `pnpm check` (astro check) verify changes. `pnpm` on PATH is 9.x and is fine for scripts.
- Dependency changes: `npx -y pnpm@12.10.1 add|remove|install ...` (plain pnpm fails with ERR_PNPM_UNEXPECTED_STORE).
- The user's own dev server runs on `[::1]:4321`. Never stop or restart it. For tests use `pnpm astro dev --port 4410` or `pnpm astro preview --port 4411`, and stop only what you started.
- After editing `integrations/*.mjs`, save `astro.config.mjs` once so the running server reloads it.

## Skills (user-invoked)

`/new-post`, `/new-component`, `/check` in `.claude/skills/`.

## Layout

- `src/content/docs/guias/{japones,llegada}/*.mdx`: the guides (Starlight docs). Sidebar order and labels live in `astro.config.mjs`.
- `src/content/blog/`, `src/content/personal/`: posts, one MDX file each (schema in `src/content.config.ts`). Listings, dates and reading time are derived from the file.
- `src/components/*.astro`: site components. `src/components/starlight/`: Starlight overrides (Header, Sidebar, Pagination, PageTitle).
- `src/pages/`: routes (`index`, `japon/`, `blog/`, `personal/`, `sellos`, `404`). `src/layouts/`: `Layout`, `PostLayout`.
- `src/styles/`: `global.css` (theme, large), `fx.css`, `post.css`. `src/data/`, `src/lib/`: typed data and helpers.
- `integrations/mdx-component-docs.mjs`: generates editor hover docs for MDX components.

## Rules for content and components

- Posts and guides are plain MDX. No raw HTML or classes in content; if Markdown is not enough, make or extend an Astro component with typed props.
- A component used in MDX must be in `AUTO_IMPORTED_COMPONENTS` (`astro.config.mjs`), so MDX files never import it. It needs a top comment (first paragraph says what it is), a JSDoc line on every prop (with `@default`) and an `@example` in MDX. The hover docs are built from those comments.
- Nothing typed twice: derive listings, sidebar and station data from one source.
- Text is neutral Spanish, no Colombian idioms, no em dashes, no slogans or bold-heavy bullets.
- Design: original look, both themes polished (dark first), strong contrast, calm hovers. Check changes in Firefox Developer Edition as well as Brave.
- Do not overstate the Japanese language barrier; interpreters and multilingual forms are common.

## Token economy

- `src/styles/global.css` is ~1400 lines: grep for the selector and read only that range.
- Guides are long. Read the section you need with offset/limit, or grep headings first.
- Never read `node_modules/`, `dist/`, `.astro/`, `pnpm-lock.yaml` (denied in settings). Use `git diff --stat` before `git diff`.
- Use Explore or a subagent only for sweeps across many files; do small lookups inline.
- `legacy/` was deleted; ignore any reference to `japanBlog.html`.
