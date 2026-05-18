# Kun's Notes

[![Built with Astro](https://astro.badg.es/v2/built-with-astro/tiny.svg)](https://astro.build)
[![Tailwind CSS](https://img.shields.io/badge/tailwindcss-0F172A?&logo=tailwindcss)](https://tailwindcss.com)
[![Formatted with Biome](https://img.shields.io/badge/Formatted_with-Biome-60a5fa?style=flat&logo=biome)](https://biomejs.dev/)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-121013?logo=github&logoColor=white)](#)

A static, bilingual (English / 中文) personal blog by [Kun Yan](https://yankun.org).
Engineering notes, project retros, occasional essays — built to load fast, share
nicely, and stay out of the way of writing.

Live at **[yankun.org](https://yankun.org)**.

## Stack

- **[Astro 6](https://astro.build)** — static site generation, content collections, image pipeline
- **[Tailwind CSS v4](https://tailwindcss.com)** — utility-first styling with shadcn-style design tokens
- **[React 19](https://react.dev)** — but *only* where interactivity demands it (theme toggle, mobile menu, posts filter, TOC scrollspy, back-to-top, language switcher)
- **[MDX](https://mdxjs.com)** — for posts and pages that need embedded components
- **[Giscus](https://giscus.app)** — GitHub Discussions-powered comments
- **[Biome](https://biomejs.dev) + [Lefthook](https://lefthook.dev)** — format & lint on pre-commit
- **[Inter](https://rsms.me/inter/) + [JetBrains Mono](https://www.jetbrains.com/lp/mono/)** — self-hosted via Astro's font pipeline

## Quick start

```bash
pnpm install
pnpm dev          # http://localhost:4321
pnpm build        # → dist/
pnpm preview      # serve the build locally
```

The first `pnpm install` runs `lefthook install` automatically, wiring the
pre-commit hook that runs `biome check --write` on staged files.

## Project layout

```
src/
├── assets/
│   ├── about/                  # images used in about page MDX
│   └── covers/                 # post cover images (processed by Astro Image)
├── components/
│   ├── *.astro                 # Nav, Footer, Hero, PostCard, Comments, LanguageSwitcher, …
│   └── react/                  # React islands only (interactive bits)
├── content/
│   ├── about/{en,zh}.mdx       # about page content per language
│   └── posts/{en,zh}/*.md      # blog posts — slug-aligned across languages
├── i18n/
│   ├── config.ts               # language list, default lang, locales
│   ├── ui.ts                   # UI string dictionary + t() helper
│   └── utils.ts                # post helpers (getPostsByLang, getReadingTime, …)
├── layouts/
│   └── BaseLayout.astro        # one layout, all the head/SEO/font wiring
├── lib/
│   ├── cn.ts                   # clsx + tailwind-merge helper
│   ├── covers.ts               # resolveCover(name) → ImageMetadata
│   └── giscus.ts               # comments config (fill in your repo IDs)
├── pages/
│   ├── index.astro             # root: JS detects browser lang, redirects to /en/ or /zh/
│   ├── 404.astro
│   └── [lang]/
│       ├── index.astro
│       ├── about.astro
│       ├── posts/{index, [slug]}.astro
│       └── rss.xml.ts
└── styles/global.css           # design tokens (HSL color vars) + prose styles
```

## Authoring

### Add a new post

Create one file per language; pair them by keeping the slug identical:

```
src/content/posts/en/my-new-post.md
src/content/posts/zh/my-new-post.md
```

Frontmatter schema (see `src/content.config.ts`):

```yaml
---
title: "My new post"
excerpt: "A one-line teaser shown in cards and meta descriptions."
date: 2026-05-18
tags: ["TypeScript", "Tools"]
cover: "my-new-post.webp"   # basename of a file in src/assets/covers/
# readingTime: "8 min"      # optional — otherwise auto-computed from body
# comments: false           # optional — hides the Giscus section on this post
# draft: true               # optional — excludes from prod build
---
```

**Translations are linked by matching slugs.** If only one language version exists,
that post simply doesn't appear in the other language's archive — the language
switcher gracefully degrades to the other language's homepage.

### Add a cover image

Drop the image (PNG / JPG / WebP) into `src/assets/covers/`, then reference its
basename in the post's `cover:` field. Astro's image pipeline handles
optimization, srcset, and content-hashed filenames automatically.

### Edit the About page

Each language is a separate MDX file: `src/content/about/{en,zh}.mdx`. Import
images from `src/assets/about/` and use the `<Image>` component from
`astro:assets`.

### Add a new language

1. Add the code to `src/i18n/config.ts` (`languages` tuple + `languageMeta` entry).
2. Add a full translation block to `src/i18n/ui.ts` (every key must exist).
3. Add a hero title segmentation entry to `heroTitleSegments` in `ui.ts`.
4. Create `src/content/about/<lang>.mdx`.
5. Translate the posts you want by adding `src/content/posts/<lang>/<slug>.md`.

That's it — routing, sitemap hreflang, RSS, and the language switcher all
discover the new language automatically.

## Customization

### Comments (Giscus)

Open `src/lib/giscus.ts` and fill in the four GitHub IDs from
[giscus.app](https://giscus.app/) (`repo`, `repoId`, `category`, `categoryId`).
Until they're set, the comments section renders a configuration hint instead of
the iframe. Per-post opt-out via `comments: false` in frontmatter.

### Fonts

Configured in `astro.config.mjs` under the top-level `fonts:` field. Currently
loads Inter (400/500/600/700) and JetBrains Mono (400/500), self-hosted with
content-hashed URLs and metric-matched fallbacks (CLS-safe).

### Theme

Light / Dark / System (follows OS), with preference persisted in
`localStorage.theme`. Tokens are defined in `src/styles/global.css` using HSL
CSS variables under `:root` and `.dark` — drop-in shadcn-compatible.

### Site URL

Update `site:` in `astro.config.mjs` if your domain changes. It's used by the
sitemap, RSS feed, OG / Twitter image URLs, canonical links, and hreflang.

## SEO

Out of the box:

- `sitemap-index.xml` + `sitemap-0.xml` (via `@astrojs/sitemap`, with i18n hreflang annotations)
- `robots.txt` pointing to the sitemap
- Per-page `<title>` / `<meta description>` / `<link rel="canonical">`
- `<link rel="alternate" hreflang>` to actual counterpart pages (plus `x-default`)
- Open Graph + Twitter Card meta on every page (with `og:image` from the post cover)
- JSON-LD `BlogPosting` schema on post detail pages
- `<time datetime>` semantic markup on all dates
- RSS feed per language: `/en/rss.xml`, `/zh/rss.xml`

After deploying, submit `https://<your-domain>/sitemap-index.xml` to
Google Search Console.

## Scripts

| Command         | What it does                                               |
|-----------------|------------------------------------------------------------|
| `pnpm dev`      | Astro dev server at `localhost:4321`                       |
| `pnpm build`    | Build to `dist/` (also generates sitemap + RSS)           |
| `pnpm preview`  | Serve the built `dist/` locally                            |
| `pnpm format`   | Run Biome formatter + class sorter on the whole repo       |
| `pnpm lint`     | Run Biome checks without writing                           |
| `pnpm prepare`  | `lefthook install` — runs automatically after `pnpm install` |

## Architectural notes

A few conventions worth knowing if you're forking or extending:

- **Astro by default, React only when needed.** If a component never needs
  client-side state, it stays `.astro`. The React folder is small on purpose.
- **Class composition uses `cn()` from `src/lib/cn.ts`** (`clsx` + `tailwind-merge`).
  Never `'foo ' + (cond ? 'bar ' : '')` — Biome's class sorter trims trailing
  spaces and you'll get classes fused together.
- **Icons via `astro-icon` + `@iconify/react`** with the `lucide:` collection,
  not `@lucide/astro` / `lucide-react`. Iconify supports the brand icons
  (github, twitter) that lucide v1 removed.
- **Reading time is auto-computed** from the markdown body (`getReadingTime`),
  with a frontmatter override if you really want a fixed number.

## License

MIT for the code. Post content (`src/content/posts/`) and assets
(`src/assets/`) are © Kun Yan, all rights reserved.
