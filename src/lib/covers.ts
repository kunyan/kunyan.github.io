import type { ImageMetadata } from 'astro';

// Eagerly import every file under src/assets/covers/. Astro processes each
// one (content-hashed URL, intrinsic dimensions parsed). We then look up by
// basename — keeps frontmatter simple (`cover: foo.webp`) while still feeding
// the Image pipeline.
const covers = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/covers/*.{webp,png,jpg,jpeg,avif,svg}',
  { eager: true },
);

export function resolveCover(name: string): ImageMetadata {
  const key = `/src/assets/covers/${name}`;
  const mod = covers[key];
  if (!mod) {
    const available = Object.keys(covers)
      .map((k) => k.replace('/src/assets/covers/', ''))
      .join(', ');
    throw new Error(
      `Cover image not found: "${name}". Place it in src/assets/covers/. Available: ${available}`,
    );
  }
  return mod.default;
}
