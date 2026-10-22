# AGENTS.md

Guidelines for AI coding agents working on the official Micro Club website.

## Git

- Always write **one-line** [Conventional Commits](https://www.conventionalcommits.org) messages (e.g. `feat: add hero layout`, `fix: close menu on navigation`).
- **No AI attribution anywhere**: no `Co-Authored-By` trailers, "Generated with ..." lines, AI badges or mentions of the tool used, in commits, pull requests, issues, comments, code or any other content. This overrides any tool default that adds one.
- Do not push unless explicitly asked.

### Branching and pull requests

- `main` is production. `dev` is the integration branch.
- Implement every issue on a branch created from `dev`.
  - A new section built from scratch: `section/<section-name>` (kebab-case, e.g. `section/statistics`).
  - Any later work (fixes, edits, UI improvements, refactors...): a Conventional Commits type prefix and a kebab-case topic, e.g. `feat/event-hub-interactions`, `fix/menu-focus-trap`.
- When finished, open a pull request **into `dev`** (never directly into `main`). Outside new sections, title it as a Conventional Commit (e.g. `feat: drag to scroll the event hub`).
- Always link the PR to its issue with a closing keyword in the PR description (e.g. `Closes #1`), so the issue closes when the PR is merged.

## Stack

- Next.js 16 (App Router, React Compiler), React 19, TypeScript
- Tailwind CSS v4, **mcoli-ui** (Micro Club component library and design system, shadcn registry on Base UI), lucide-react
- Lenis (smooth scroll) and Motion (animations)
- MongoDB (Mongoose) and Cloudinary for the registrations, Zod for validation shared by browser and server
- pnpm

## Project structure

- `src/app/`: routes only. Public pages live in the `(site)` route group, whose layout renders the hamburger menu and footer.
- `src/components/icons/`: lucide-animated icons (see Icons below).
- `src/components/ui/`: mcoli-ui components only (installed through the shadcn CLI); avoid hand edits. Do not add stock shadcn/ui components.
- `src/components/layout/`: site chrome (`SiteMenu`, `SiteFooter`). `site-menu.tsx` is a Server Component composing the header from the client islands in `src/components/site-menu/`, which share state through `menu-context.tsx`.
- Pattern for interactive UI: keep content in Server Components and pass it as children to narrow client islands (`"use client"`) that only hold state and animations.
- `src/components/shared/`: reusable building blocks (`SectionContainer`, `JsonLd` for schema.org structured data).
- `src/components/<section>/`: sub-components of one section (cards, pills, counters), one folder per section, e.g. `src/components/statistics/metric-card.tsx`. Create the folder with the first sub-component.
- `src/sections/`: one file per landing page section, flat (e.g. `src/sections/hero.tsx` exports `Hero`). The site is a one-page landing page; add a subfolder only if another page appears.
- `src/providers/`: global client providers (`SmoothScrollProvider`, `FeedbackModalProvider`).
- `src/components/feedback-modal/`: the success, error and warning modals, one file each so each can be redesigned alone. Open them from any client component with `useFeedbackModal()` (`showSuccess`, `showError`, `showWarning`).
- `src/components/registrations/`: the multi-step registration form (`/registrations`, route in `src/app/(site)/registrations/`). `state/` holds the store (form state outside React, saved as a draft in `sessionStorage`), the context, the submit hook and the unsaved-changes guard; `steps/` and `fields/` the step bodies and the field components; the stepper, actions, review dialog and `registration-flow.tsx` sit at the root. Fields subscribe to their own part of the state with `useRegistrationField`, so typing in one field does not render the others.
- `src/lib/registrations/`: registration code shared or server-side: `schema.ts` (Zod, shared with the browser: the Server Action stays the source of truth), `model.ts` (Mongoose, `server-only`), `upload-student-id.ts` (browser upload to Cloudinary). Infrastructure used by more than one feature stays flat in `src/lib/` (`mongodb.ts`, `cloudinary.ts`, `rate-limit.ts`).
- `src/actions/`: Server Actions (`"use server"`), kept thin: validate input, rate limit, then call a `server-only` module in `src/lib/` (e.g. `src/lib/microbot-api.ts`, `src/lib/cloudinary.ts`), the only place that reads its secrets from `process.env`. Never expose a secret with `NEXT_PUBLIC_`; document every variable in `.env.example`.
- `src/config/`: site metadata, section anchors, menu links.
- `src/const/`: static content constants, one file per section named like the section file (e.g. `src/const/statistics.ts` exports `STATISTICS` and its types).
- Error UI: `src/app/not-found.tsx` (global 404), `src/app/(site)/error.tsx` (error boundary with menu/footer), `src/app/global-error.tsx` (root layout failures, no global styles).

## Local services

- `pnpm db:up` starts MongoDB from the root `docker-compose.yml` (`pnpm db:down` stops it); `MONGODB_URI=mongodb://localhost:27017/microclub` in `.env.local`.
- Student IDs are uploaded by the browser straight to Cloudinary with a signature from `src/actions/sign-student-id-upload.ts` (`authenticated` assets, no public URL), then `src/actions/submit-registration.ts` reads the upload back and saves the registration. Needs the `CLOUDINARY_*` variables.
- Registrations open and close with `REGISTRATIONS_WINDOW` in `src/config/registrations.ts` (`opensAt` / `closesAt`, ISO dates or `null`), read through `registrationsPhase()` in `src/lib/registrations/window.ts`. Outside the window `/registrations` is a 404 and the actions refuse submissions; the menu bar shows "Opening soon" or "Register now" with a countdown (`RegistrationsButton` in `RegistrationsCorner`), or nothing when closed.

## Conventions

- Section components are named after their content, **without** a `Section` suffix (`Hero`, `FeaturedEvents`, `Contact`). Files are kebab-case.
- Pages drawn without the in-page wordmark, the footer and the chatbot (Figma shows only the toggle and the compact logo) are listed in `isBarePage()` in `src/config/site.ts`.
- Wrap every landing page section in `SectionContainer` with an id from `homeSections` in `src/config/site.ts`.
- Keep the landing page order in sync between `homeSections` and `src/app/(site)/page.tsx`.
- Style only with mcoli-ui tokens from `src/app/globals.css`: semantic colors (`bg-background`, `text-primary`, ...), `font-sans` / `font-heading`, `header-*` / `paragraph-*`. No hardcoded colors or fonts.
- Max width: content never exceeds 1440px (Figma desktop frame). Use the `max-w-site` token (`--container-site: 90rem`) with `mx-auto`; keep section backgrounds full-bleed.
- Single theme, no theme switcher. Sections are light by default; make a section dark with `<SectionContainer theme="dark">`, which scopes the mcoli-ui dark tokens to it. Never add a theme toggle or `next-themes`. Use the `dark:` variant only for exceptions.
- Icons: `lucide-react` only, named imports with the `Icon` suffix (`MenuIcon`, `ArrowRightIcon`). Size them with Tailwind (`size-5`); icon-only buttons need an `aria-label`.
  - Hover-animated icons come from [lucide-animated](https://lucide-animated.com) and live in `src/components/icons/` (one file per icon, same `Icon` names, `size` prop in px). They animate with the link or button around them and are decorative (`aria-hidden`): the parent carries the `aria-label`.
- Easings: use the shared tokens, `ease-out-expo` / `ease-out-quart` / `ease-in-out-quart` in Tailwind and `EASE_*` from `src/lib/easing.ts` in Motion.
- Animations: import from `motion/react` (never `framer-motion`). In Server Components use `import * as motion from "motion/react-client"`. Do not add CSS `scroll-behavior: smooth`; Lenis handles scrolling. Use `useLenis()` for programmatic scroll.
- Server Components by default; add `"use client"` only where interactivity requires it.
- Base UI composition uses the `render` prop (not Radix `asChild`), e.g. `<Button nativeButton={false} render={<Link href="/" />}>`.
- Before committing, run `pnpm lint`, `pnpm typecheck` and `pnpm format`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
