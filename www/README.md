# cera.love — landing page

Astro 7 + React islands. Trilingual: `/` (PL), `/ua/`, `/en/`. Legal pages
(`/privacy`, `/terms`) render `../legal/*.md`.

## Commands

```sh
bun install
bun run dev        # dev server
bun run build      # static build to dist/
bun run typecheck  # astro check
```

## Waitlist

The form POSTs `{ email, locale }` as JSON to `PUBLIC_WAITLIST_URL`.
Until that env var is set at build time, submits show the error state —
point it at a Convex HTTP action to go live.

## App screenshots

`src/assets/app/*.png` are captured from the real Expo app (light + dark ×
pl/ua/en) with seeded demo data. Regenerate: run `bun start-web` in repo root,
then the capture script (see git history of this file's PR, or ask an agent to
re-derive: seed `cosmetics_shelf`, `routine_config`, `app_locale` in
localStorage and screenshot at 390×844@2x).
