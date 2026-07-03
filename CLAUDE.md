- This project uses Bun (not NPM, PNPM, or Yarn). Use `bunx` instead of `npx`
- End-to-end tests should be whole user flows, not simple checks.

## Development Commands

Run from repo root (app lives at root, not in an `expo/` subdir): `bun start-web`, `bun start`, `bun typecheck`, `bun lint`.

Run `hk install` once to set up pre-commit hooks (prettier, eslint, typecheck via `hk.pkl`).

## Convex

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for guidelines on
how to use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.
