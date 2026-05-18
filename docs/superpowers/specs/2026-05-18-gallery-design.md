# Gallery Page — Design Spec

**Date:** 2026-05-18
**Status:** Draft, pending user review

## Goal

Add a `/[lang]/gallery/` page to the existing Astro blog that showcases photography work in a modern, design-forward style reminiscent of 500px and Flickr. The page must integrate cleanly with the project's existing visual system (shadcn neutral palette, Inter font, dark mode, i18n), and every photo must flow through Astro's `<Image>` pipeline for optimization.

## Decisions Locked In

| Question | Choice |
|---|---|
| Content source | Astro content collection at `src/content/gallery/` |
| i18n | One photo list shared across `/en/gallery/` and `/zh/gallery/`; UI strings localized |
| Photo metadata | `title`, `caption?`, `date`, `location?`, `tags[]`, `image` |
| Layout | Justified Rows (CSS-only flex, `flex-grow` ∝ aspect ratio) |
| Click target | Lightbox overlay (vanilla JS), URL hash for shareability |
| Filtering | Top tag chips (CSS-only via `data-active-tag` + attribute selectors) |
| Hero | Minimal: "Gallery" headline, subtitle, photo count, date range |
| EXIF | Not displayed |

## Architecture

### Content collection

`src/content.config.ts` — add a `gallery` collection alongside `posts` and `about`.

```ts
const gallery = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/gallery' }),
  schema: z.object({
    title: z.string(),
    caption: z.string().optional(),
    date: z.coerce.date(),
    location: z.string().optional(),
    tags: z.array(z.string()).default([]),
    image: z.string(), // basename under src/assets/gallery/, e.g. "sunset-suzhou.jpg"
  }),
});
```

Each photo is one `.md` file (body empty or used as long-form caption later). The file id (e.g. `sunset-suzhou`) becomes the URL hash slug.

### Image resolution

`src/lib/photos.ts` — mirrors the pattern in `src/lib/covers.ts`:

```ts
const photos = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/gallery/*.{webp,png,jpg,jpeg,avif}',
  { eager: true },
);

export function resolveGalleryImage(name: string): ImageMetadata { ... }
```

The returned `ImageMetadata` carries intrinsic width/height — used to compute aspect ratio at build time. No runtime measurement, no layout shift.

### Routes

- `src/pages/[lang]/gallery/index.astro` — the single gallery page, generated for both `en` and `zh` via `getStaticPaths`.

No detail-page route. The lightbox lives in the same page and is opened by hash.

### Component breakdown

```
src/pages/[lang]/gallery/index.astro
  ├─ <GalleryHero /> (.astro)           — title, subtitle, count + date-range
  ├─ <GalleryTagFilter /> (.astro)      — chip row, CSS-only filter
  ├─ <GalleryGrid /> (.astro)           — justified-rows flex container
  │    └─ <GalleryItem /> (.astro)      — single <Image> wrapper, anchor that opens lightbox
  └─ <GalleryLightbox /> (.astro + inline script) — overlay, prev/next, metadata panel, hash sync
```

Each component is self-contained and small enough to read end-to-end. The lightbox script is the one piece of imperative JS — kept inline in the lightbox component so the gallery page works with `client:none` everywhere else.

## Layout details

### Justified-rows CSS

```html
<div class="gallery-grid">
  <a class="gallery-item" style={`flex-grow: ${aspectRatio}; flex-basis: ${aspectRatio * 280}px`}>
    <Image ... />
  </a>
</div>
```

```css
.gallery-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.gallery-item {
  height: 280px;
  flex-grow: var(--ar);   /* aspect ratio */
  flex-basis: calc(var(--ar) * 280px);
  min-width: 0;
}
.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
@media (max-width: 640px) {
  .gallery-item { height: 180px; flex-basis: calc(var(--ar) * 180px); }
}
```

The last row is allowed to be short of full width (Flickr/500px behavior). No JS measurement; aspect ratio is computed in the `.astro` file from `image.width / image.height` at build time and inlined as a CSS custom property.

### Tag filter

Each `.gallery-item` carries `data-tags="street portrait night"`. The chip row sets `data-active-tag` on the grid container:

```css
.gallery-grid[data-active-tag="street"] .gallery-item:not([data-tags~="street"]) {
  display: none;
}
.gallery-grid[data-active-tag="all"] .gallery-item { display: block; }
```

The chip click handler is ~10 lines of vanilla JS in an `<script>` inside the filter component. No React island.

### Lightbox

- Hidden by default (`hidden` attr). Opens when an item is clicked OR when `location.hash` matches a photo slug.
- Backdrop: `bg-black/90`, full-viewport, click-to-close.
- Image rendering: at build time, every photo's lightbox-size `<Image>` is pre-rendered into a hidden `<template>` element (so Astro's pipeline produces the optimized srcset for each). The lightbox script clones the active template into the visible slot and removes it on close. `loading="lazy"` on every `<Image>` ensures the browser only fetches the photo actually displayed.
- Metadata panel: right side on desktop (`lg:w-80`), bottom drawer on mobile. Displays title, caption, formatted date, location, and tags chip row.
- Keyboard: `←` / `→` to navigate, `Esc` to close.
- Hash sync: opening photo `sunset-suzhou` sets `location.hash = '#sunset-suzhou'`; closing resets to `#`. `hashchange` listener handles deep-linking and back-button.
- Focus trap: the lightbox traps Tab inside while open, restores focus on close (accessibility).

The lightbox JS is ~80 lines of vanilla, contained in a single `<script>` tag at the bottom of the lightbox component.

### Hero

Minimal header section above the grid:

```
Gallery
A visual journal of moments worth pausing for.

42 photos · 2019 — 2026
```

Reuses the existing `container` class and Tailwind spacing tokens from other pages. No animation (keeps it cleaner than the home Hero — photos do the talking).

## i18n strings to add

In `src/i18n/ui.ts`:

```
gallery.title         "Gallery" / "影像"
gallery.subtitle      "A visual journal of moments worth pausing for." / "值得停下来的瞬间。"
gallery.countMany     "{n} photos" / "{n} 张照片"
gallery.dateRange     "{start} — {end}" / "{start} — {end}"
gallery.tagAll        "All" / "全部"
gallery.closeLightbox "Close" / "关闭"
gallery.prevPhoto     "Previous photo" / "上一张"
gallery.nextPhoto     "Next photo" / "下一张"
gallery.empty         "No photos match this filter." / "没有匹配的照片。"
```

Tag labels themselves stay as-is in the frontmatter (lowercase English keys recommended for consistency). If localized display is needed later, add a per-tag translation map.

## Nav integration

`src/components/Nav.astro` — add `Gallery` between Posts and About:

```ts
const links = [
  { label: t(lang, "nav.home"), href: localizedPath(lang, "/") },
  { label: t(lang, "nav.posts"), href: localizedPath(lang, "/posts/") },
  { label: t(lang, "nav.gallery"), href: localizedPath(lang, "/gallery/") },
  { label: t(lang, "nav.about"), href: localizedPath(lang, "/about/") },
];
```

Add `nav.gallery` ("Gallery" / "影像") to `ui.ts`. The active-state logic already handles arbitrary paths.

## Astro Image config

For each gallery item (grid thumbnail):

```astro
<Image
  src={image}
  alt={photo.data.title}
  widths={[400, 800, 1200]}
  sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
  loading="lazy"
  decoding="async"
/>
```

For the lightbox big image:

```astro
<Image
  src={image}
  alt={photo.data.title}
  widths={[1200, 1800, 2400]}
  sizes="100vw"
  loading="lazy"
/>
```

All photos pass through Sharp (already a dep) → webp/avif derivatives with content-hashed URLs, just like covers.

## Sample frontmatter

`src/content/gallery/sunset-suzhou.md`:

```yaml
---
title: Sunset at Tiger Hill
caption: Last light over the canal.
date: 2024-10-18
location: Suzhou, CN
tags: [street, golden-hour]
image: sunset-suzhou.jpg
---
```

## Out of scope

- EXIF auto-extraction
- Featured photo / home-page integration
- Multi-page pagination (single page handles 100 photos comfortably with lazy loading)
- Photo detail routes / per-photo Open Graph images
- Search box, sort dropdown, infinite scroll

If photo count grows past ~200, revisit pagination or virtual scrolling.

## Open assumptions

1. Initial gallery contains ≤100 photos — single-page is performant.
2. Photo files are pre-resized to ~3000px max long edge before being checked into `src/assets/gallery/`. Astro Sharp will derive smaller variants but won't downscale enormous originals indefinitely.
3. Photos are curated, not bulk-imported — manual frontmatter authoring is acceptable.

## Acceptance criteria

- [ ] Page lives at `/en/gallery/` and `/zh/gallery/` with the new nav link.
- [ ] Adding a new photo: drop file in `src/assets/gallery/`, create one `.md` in `src/content/gallery/`. Nothing else.
- [ ] Justified rows align flush left/right with no JS measurement; rows reflow on resize via CSS.
- [ ] Clicking any photo opens the lightbox; `←` `→` navigate; `Esc` closes; URL hash updates and supports deep linking.
- [ ] Tag chip click filters the grid instantly with no flicker.
- [ ] Dark mode works without extra styles (uses existing tokens).
- [ ] No layout shift during image load (intrinsic dimensions wired through).
- [ ] Lighthouse Performance ≥ 90 on a gallery with 30+ photos.
