import type { ImageMetadata } from 'astro';

// Eagerly import every gallery photo. Astro processes each (content-hashed
// URL, intrinsic width/height parsed). Look up by basename so frontmatter
// stays simple (`image: foo.jpg`).
const photos = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/gallery/*.{webp,png,jpg,jpeg,avif}',
  { eager: true },
);

export function resolveGalleryImage(name: string): ImageMetadata {
  const key = `/src/assets/gallery/${name}`;
  const mod = photos[key];
  if (!mod) {
    const available = Object.keys(photos)
      .map((k) => k.replace('/src/assets/gallery/', ''))
      .join(', ');
    throw new Error(
      `Gallery image not found: "${name}". Place it in src/assets/gallery/. Available: ${available}`,
    );
  }
  return mod.default;
}
