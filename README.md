# mc-website

Official MicroClub website. It replaces the current site at [microclub.info](https://www.microclub.info/).

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, React Compiler, Turbopack)
- [React 19](https://react.dev) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com) on [Base UI](https://base-ui.com) (`base-nova` style)
- [lucide-react](https://lucide.dev) icons
- [pnpm](https://pnpm.io) package manager

## Getting started

Requirements: Node.js 20.9+ and pnpm 10+.

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command          | Description                        |
| ---------------- | ---------------------------------- |
| `pnpm dev`       | Start the dev server               |
| `pnpm build`     | Build for production               |
| `pnpm start`     | Serve the production build         |
| `pnpm lint`      | Run ESLint                         |
| `pnpm typecheck` | Generate route types and run `tsc` |
| `pnpm format`    | Format the codebase with Prettier  |

## Project structure

```
src/
├── app/
│   ├── layout.tsx            # Root layout: <html>, fonts, global metadata
│   ├── globals.css           # Tailwind + shadcn theme tokens
│   ├── robots.ts / sitemap.ts
│   └── (site)/               # Public site route group
│       ├── layout.tsx        # Hamburger menu + footer
│       └── page.tsx          # Landing page (composes the sections in order)
├── components/
│   ├── ui/                   # shadcn/ui primitives (generated, do not edit by hand)
│   ├── layout/               # SiteMenu (hamburger), SiteFooter
│   ├── shared/               # Reusable building blocks (SectionContainer)
│   └── sections/home/        # One component per landing page section (hero.tsx, about.tsx, ...)
├── config/site.ts            # Site metadata, section anchors, menu links
├── data/                     # Static content (featured projects, events)
└── lib/utils.ts              # `cn` helper
```

## Landing page sections

Rendered in this order by `src/app/(site)/page.tsx`. Each section has an anchor id used by the hamburger menu.

| #   | Section          | Component          | Anchor               | Status                                                       |
| --- | ---------------- | ------------------ | -------------------- | ------------------------------------------------------------ |
| 1   | Hero             | `Hero`             | `#hero`              | Scaffold                                                     |
| 2   | About Us         | `About`            | `#about`             | Scaffold                                                     |
| 3   | Statistics       | `Statistics`       | `#statistics`        | Waiting for data                                             |
| 4   | Our Sections     | `ClubSections`     | `#club-sections`     | Scaffold                                                     |
| 5   | What We've Built | `FeaturedProjects` | `#featured-projects` | Mcoli-UI, mAIcro + "Explore more" to `/projects`             |
| 6   | Our Departments  | `Departments`      | `#departments`       | Scaffold                                                     |
| 7   | Featured Events  | `FeaturedEvents`   | `#featured-events`   | Tatweer, MCTF, MGV, Micro Hack + "Explore more" to `/events` |
| 8   | Trusted By       | `TrustedBy`        | `#trusted-by`        | Waiting for sponsors list                                    |
| 9   | MC Community     | `Community`        | `#community`         | Scaffold                                                     |
| 10  | Ask MicroBot     | `MicroBot`         | `#microbot`          | Chatbot that replaces the FAQ                                |
| 11  | Contact Us       | `Contact`          | `#contact`           | Small contact form                                           |

To add or reorder a section, update both `homeSections` in `src/config/site.ts` and `src/app/(site)/page.tsx`.

## Adding shadcn components

```bash
pnpm dlx shadcn@latest add <component>
```
