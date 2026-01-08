# Claude Code Project Notes

## Package Manager

This project uses **Bun** (not NPM, PNPM, or Yarn).

## Development Commands

- Start web dev server: `bun start-web`
- Start mobile dev server: `bun start`
- Type check: `bun run typecheck`
- Lint: `bun run lint`

## Styling

This project uses **Uniwind** for Tailwind-style styling in React Native.

- Components use the `tw` prop for Tailwind classes
- Dynamic theme colors use inline `style` prop
- CSS entry file: `src/global.css`
- Config: `uniwind.config.js`
