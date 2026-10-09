---
name: check
description: Run the type check and the production build and report only what failed.
disable-model-invocation: true
---

Run `pnpm check` and `pnpm build`. Do not touch the dev server on port 4321.
Report in a few lines: pass or fail for each, and for every error the file, line and message. Do not paste the full output. If everything passes, say so in one line. Fix errors only if the user asked for it.
