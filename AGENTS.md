# AGENTS.md

Guidelines for AI coding agents working on the official MicroClub website.

## Git

- Always write **one-line** [Conventional Commits](https://www.conventionalcommits.org) messages (e.g. `feat: add hero layout`, `fix: close menu on navigation`).
- **Never** add co-author trailers (`Co-Authored-By`) or any other attribution to commits.
- Do not push unless explicitly asked.

## Stack

- Next.js 16 (App Router, React Compiler), React 19, TypeScript
- Tailwind CSS v4, shadcn/ui on **Base UI** (`base-nova` style), lucide-react
- pnpm

## Project structure

- `src/app/`: routes only. Public pages live in the `(site)` route group, whose layout renders the hamburger menu and footer.
- `src/components/ui/`: shadcn primitives. Add them with `pnpm dlx shadcn@latest add <name>`; avoid hand edits.
- `src/components/layout/`: site chrome (`SiteMenu`, `SiteFooter`).
- `src/components/shared/`: reusable building blocks (`SectionContainer`).
- `src/components/sections/<page>/`: one component per page section (e.g. `sections/home/hero.tsx` exports `Hero`).
- `src/config/`: site metadata, section anchors, menu links.
- `src/data/`: static content (featured projects, events).

## Conventions

- Section components are named after their content, **without** a `Section` suffix (`Hero`, `FeaturedEvents`, `Contact`). Files are kebab-case.
- Wrap every landing page section in `SectionContainer` with an id from `homeSections` in `src/config/site.ts`.
- Keep the landing page order in sync between `homeSections` and `src/app/(site)/page.tsx`.
- Server Components by default; add `"use client"` only where interactivity requires it.
- Base UI composition uses the `render` prop (not Radix `asChild`), e.g. `<Button nativeButton={false} render={<Link href="/events" />}>`.
- Before committing, run `pnpm lint`, `pnpm typecheck` and `pnpm format`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
