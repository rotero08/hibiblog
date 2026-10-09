---
name: new-post
description: Scaffold a new blog or personal post as a single MDX file with correct frontmatter. Use when the user wants to start a post.
disable-model-invocation: true
argument-hint: "[blog|personal] <title>"
---

Create one post in `src/content/blog/` or `src/content/personal/` (ask only if the folder is not given).

1. File name: kebab-case slug of the title, no accents, `.mdx`. It becomes the URL.
2. Frontmatter exactly as the schema in `src/content.config.ts`: `title`, `description` (one or two sentences), `date` (today, YYYY-MM-DD), optional `tag` and `ja`, and `draft: true` until the user says it is ready.
3. Body: plain Markdown/MDX. Use existing components from `AUTO_IMPORTED_COMPONENTS` (never import them, never write raw HTML or classes). An image followed by an italic line is its caption.
4. Style: neutral Spanish for Colombian readers, no Colombian idioms, no em dashes, no slogans, no bold-heavy bullets.
5. Look at one existing post in the same folder first for tone and structure. Do not run a build for a new post.
