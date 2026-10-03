# AGENTS.md

Guidelines for AI coding agents working on the official MicroClub website.

## Git

- Always write **one-line** [Conventional Commits](https://www.conventionalcommits.org) messages (e.g. `feat: add hero layout`, `fix: close menu on navigation`).
- **Never** add co-author trailers (`Co-Authored-By`) or any other attribution to commits.
- Do not push unless explicitly asked.

### Branching and pull requests

- `main` is production. `dev` is the integration branch.
- Implement every issue on a branch created from `dev`, named `section/<section-name>` (kebab-case, e.g. `section/statistics`).
- When finished, open a pull request **into `dev`** (never directly into `main`).
- Always link the PR to its issue with a closing keyword in the PR description (e.g. `Closes #1`), so the issue closes when the PR is merged.

## Stack

- Next.js 16 (App Router, React Compiler), React 19, TypeScript
- Tailwind CSS v4, **mcoli-ui** (MicroClub component library and design system, shadcn registry on Base UI), lucide-react
- Lenis (smooth scroll) and Motion (animations)
- pnpm

## Project structure

- `src/app/`: routes only. Public pages live in the `(site)` route group, whose layout renders the hamburger menu and footer.
- `src/components/ui/`: mcoli-ui components only (installed through the shadcn CLI); avoid hand edits. Do not add stock shadcn/ui components.
- `src/components/providers/`: client providers (`SmoothScrollProvider`).
- `src/components/layout/`: site chrome (`SiteMenu`, `SiteFooter`).
- `src/components/shared/`: reusable building blocks (`SectionContainer`).
- `src/components/sections/<page>/`: one component per page section (e.g. `sections/home/hero.tsx` exports `Hero`).
- `src/config/`: site metadata, section anchors, menu links.
- Error UI: `src/app/not-found.tsx` (global 404), `src/app/(site)/error.tsx` (error boundary with menu/footer), `src/app/global-error.tsx` (root layout failures, no global styles).

## Conventions

- Section components are named after their content, **without** a `Section` suffix (`Hero`, `FeaturedEvents`, `Contact`). Files are kebab-case.
- Wrap every landing page section in `SectionContainer` with an id from `homeSections` in `src/config/site.ts`.
- Keep the landing page order in sync between `homeSections` and `src/app/(site)/page.tsx`.
- Style only with mcoli-ui tokens from `src/app/globals.css`: semantic colors (`bg-background`, `text-primary`, ...), `font-sans` / `font-heading`, `header-*` / `paragraph-*`. No hardcoded colors or fonts.
- Single theme, no theme switcher. Sections are light by default; make a section dark with `<SectionContainer theme="dark">`, which scopes the mcoli-ui dark tokens to it. Never add a theme toggle or `next-themes`. Use the `dark:` variant only for exceptions.
- Icons: `lucide-react` only, named imports with the `Icon` suffix (`MenuIcon`, `ArrowRightIcon`). Size them with Tailwind (`size-5`); icon-only buttons need an `aria-label`.
- Animations: import from `motion/react` (never `framer-motion`). In Server Components use `import * as motion from "motion/react-client"`. Do not add CSS `scroll-behavior: smooth`; Lenis handles scrolling. Use `useLenis()` for programmatic scroll.
- Server Components by default; add `"use client"` only where interactivity requires it.
- Base UI composition uses the `render` prop (not Radix `asChild`), e.g. `<Button nativeButton={false} render={<Link href="/" />}>`.
- Before committing, run `pnpm lint`, `pnpm typecheck` and `pnpm format`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
