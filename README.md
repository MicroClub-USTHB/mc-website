# mc-website

Official MicroClub website. It replaces the current site at [microclub.info](https://www.microclub.info/).

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, React Compiler, Turbopack)
- [React 19](https://react.dev) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- **mcoli-ui**, the MicroClub component library and design system (shadcn/ui registry on [Base UI](https://base-ui.com))
- [Lenis](https://lenis.darkroom.engineering) for smooth scrolling
- [Motion](https://motion.dev) for animations
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
│   ├── not-found.tsx         # Global 404 page
│   ├── global-error.tsx      # Fallback when the root layout fails
│   └── (site)/               # Public site route group
│       ├── layout.tsx        # Hamburger menu + footer
│       ├── error.tsx         # Error boundary for site pages
│       └── page.tsx          # Landing page (composes the sections in order)
├── components/
│   ├── ui/                   # mcoli-ui components (generated, do not edit by hand)
│   ├── layout/               # SiteMenu (hamburger), SiteFooter
│   ├── shared/               # Reusable building blocks (SectionContainer)
│   └── <section>/            # Sub-components of one section (e.g. statistics/metric-card.tsx)
├── sections/                 # One file per landing page section (hero.tsx, statistics.tsx, ...)
├── providers/                # SmoothScrollProvider (Lenis + Motion)
├── config/site.ts            # Site metadata, section anchors, menu links
├── const/                    # Static content per section (e.g. statistics.ts)
└── lib/utils.ts              # `cn` helper
```

## Landing page sections

Rendered in this order by `src/app/(site)/page.tsx`. Each section has an anchor id used by the hamburger menu.

| #   | Section          | Component          | Anchor               | Status                        |
| --- | ---------------- | ------------------ | -------------------- | ----------------------------- |
| 1   | Hero             | `Hero`             | `#hero`              | Scaffold                      |
| 2   | About Us         | `About`            | `#about`             | Scaffold                      |
| 3   | Statistics       | `Statistics`       | `#statistics`        | Waiting for data              |
| 4   | Our Sections     | `ClubSections`     | `#club-sections`     | Scaffold                      |
| 5   | What We've Built | `FeaturedProjects` | `#featured-projects` | Scaffold                      |
| 6   | Our Departments  | `Departments`      | `#departments`       | Scaffold                      |
| 7   | Featured Events  | `FeaturedEvents`   | `#featured-events`   | Scaffold                      |
| 8   | Trusted By       | `TrustedBy`        | `#trusted-by`        | Waiting for sponsors list     |
| 9   | MC Community     | `Community`        | `#community`         | Scaffold                      |
| 10  | Ask MicroBot     | `MicroBot`         | `#microbot`          | Chatbot that replaces the FAQ |
| 11  | Contact Us       | `Contact`          | `#contact`           | Small contact form            |

To add or reorder a section, update both `homeSections` in `src/config/site.ts` and `src/app/(site)/page.tsx`.

## Design system (mcoli-ui)

All tokens live in `src/app/globals.css` and are exposed as Tailwind utilities.

- **Fonts** (loaded with `next/font` in `src/app/layout.tsx`): DM Sans for body text (`font-sans`, default) and Plus Jakarta Sans for headings (`font-heading`, applied to `h1`-`h6` by default).
- **Typography utilities**: `header-xl` / `header-lg` / `header-md` / `header-sm` / `header-xs` and `paragraph-xl` ... `paragraph-xs`.
- **Semantic colors**: `bg-background`, `text-foreground`, `bg-primary`, `text-muted-foreground`, `border-border`, `bg-success`, `bg-warning`, ... They resolve to the light or dark values depending on the section.
- **Palette**: `baby-blue-*`, `blue-primary-*`, `purple-secondary-*`, `cyan-*`, `pink-*`, `orange-*`, `gray-*`, `gray-blue-*`, ...
- **Easings**: `ease-out-expo`, `ease-out-quart`, `ease-in-out-quart` (mirrored for Motion in `src/lib/easing.ts`).
- **Layout**: `max-w-site` (1440px, the Figma desktop frame width) for content width; section backgrounds stay full-bleed.
- **Other**: `shadow-xs` ... `shadow-3xl`, `blur-sm` ... `blur-xl`, `bg-it-gradient`.

### Light and dark sections

There is no theme switcher: the site has a single theme. Each section is either light (default) or dark:

```tsx
<SectionContainer id="statistics" title="Statistics" theme="dark">
```

`theme="dark"` adds the `dark` class to the section, which swaps every semantic token (`bg-background`, `text-foreground`, `text-primary`, ...) to its dark value for that section and its children. Use the `dark:` variant only for exceptions.

### Scrollbar

Styled in `globals.css` with the standard `scrollbar-width` / `scrollbar-color` properties (thin, `foreground` thumb on `muted` track), plus a `::-webkit-scrollbar` fallback for older browsers. Nested scroll areas inside dark sections follow the dark tokens.

### Icons

[lucide-react](https://lucide.dev/guide/packages/lucide-react): named imports with the `Icon` suffix (`import { MenuIcon } from "lucide-react"`), tree-shaken. Icons are `aria-hidden` by default; give icon-only buttons an `aria-label`.

## Animations and smooth scroll

- Lenis is mounted once in `SmoothScrollProvider` and driven by Motion's frame loop (`autoRaf: false`), so scrolling and animations share one `requestAnimationFrame`.
- Anchor links (`/#about`) scroll smoothly through Lenis. Access the instance with `useLenis()` from `lenis/react`.
- Animate with `motion/react` in Client Components. In Server Components, use `import * as motion from "motion/react-client"`.
- Motion respects the OS "reduce motion" setting (`MotionConfig reducedMotion="user"`).

## Adding components

mcoli-ui components are installed into `src/components/ui/` with the shadcn CLI (configured in `components.json`).
