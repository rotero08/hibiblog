---
name: new-component
description: Create an Astro component meant for MDX, documented so the editor hover works, and register it for auto-import.
disable-model-invocation: true
argument-hint: "<ComponentName> <what it is for>"
---

1. Create `src/components/<Name>.astro`. Read a small sibling first (for example `Frases.astro`) and match its idiom and comment density.
2. Top comment in the frontmatter script: the first paragraph says what the component is and when to use it; then an `@example` with an MDX snippet.
3. A typed `interface Props` with a JSDoc line on every prop, with `@default` where there is one.
4. Content authors must never write HTML or classes: everything goes through props or a slot. Styles stay inside the component (scoped) and work in both themes, dark first, with strong contrast and calm hovers.
5. Add `'./src/components/<Name>.astro'` to `AUTO_IMPORTED_COMPONENTS` in `astro.config.mjs`. Saving that file also makes the user's dev server reload the hover docs.
6. Run `/check` when done.
