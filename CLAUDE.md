- This project uses Bun (not NPM, PNPM, or Yarn). Use `bunx` instead of `npx`
- End-to-end tests should be whole user flows, not simple checks.

## Development Commands

Run from repo root (app lives at root, not in an `expo/` subdir): `bun start-web`, `bun start`, `bun typecheck`, `bun lint`.

Run `hk install` once to set up pre-commit hooks (prettier, eslint, typecheck via `hk.pkl`).
