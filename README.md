# mc-website

Official MicroClub website. It replaces the current site at [microclub.info](https://www.microclub.info/).

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, React Compiler, Turbopack)
- [React 19](https://react.dev) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- **mcoli-ui**, the MicroClub component library and design system (shadcn/ui registry on [Base UI](https://base-ui.com))
- [next-themes](https://github.com/pacocoursey/next-themes) for light/dark mode
- [lucide-react](https://lucide.dev) icons
- [pnpm](https://pnpm.io) package manager

## Getting started

Requirements: Node.js 24 (see `.nvmrc`) and pnpm 10+.

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
│   ├── globals.css           # mcoli-ui design tokens (colors, radius, shadows, typography)
│   ├── robots.ts / sitemap.ts
│   └── (site)/               # Public site route group
│       ├── layout.tsx        # Hamburger menu + footer
│       └── page.tsx          # Landing page (composes the sections in order)
├── components/
│   ├── ui/                   # mcoli-ui components (generated, do not edit by hand)
│   ├── providers/            # ThemeProvider (next-themes)
│   ├── layout/               # SiteMenu (hamburger), ThemeToggle, SiteFooter
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

## Design system (mcoli-ui)

All tokens live in `src/app/globals.css` and are exposed as Tailwind utilities.

- **Fonts** (loaded with `next/font` in `src/app/layout.tsx`): DM Sans for body text (`font-sans`, default) and Plus Jakarta Sans for headings (`font-heading`, applied to `h1`-`h6` by default).
- **Typography utilities**: `header-xl` / `header-lg` / `header-md` / `header-sm` / `header-xs` and `paragraph-xl` ... `paragraph-xs`.
- **Semantic colors**: `bg-background`, `text-foreground`, `bg-primary`, `text-muted-foreground`, `border-border`, `bg-success`, `bg-warning`, ... They switch automatically between light and dark.
- **Palette**: `baby-blue-*`, `blue-primary-*`, `purple-secondary-*`, `cyan-*`, `pink-*`, `orange-*`, `gray-*`, `gray-blue-*`, ...
- **Other**: `shadow-xs` ... `shadow-3xl`, `blur-sm` ... `blur-xl`, `bg-it-gradient`.

### Light / dark mode

Handled by `next-themes` (`src/components/providers/theme-provider.tsx`). It follows the OS preference by default, toggles the `.dark` class on `<html>` and persists the choice in `localStorage`. Use the `dark:` variant only for exceptions; semantic tokens already adapt.

## Adding components

mcoli-ui components are installed into `src/components/ui/` with the shadcn CLI (configured in `components.json`).
