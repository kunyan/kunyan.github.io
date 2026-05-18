import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    date: z.coerce.date(),
    /** Optional manual override; if omitted, reading time is auto-computed from the body. */
    readingTime: z.string().optional(),
    tags: z.array(z.string()),
    // Basename of a cover image under src/assets/covers/, e.g. "foo.webp".
    // The Image pipeline processes it (optimization, srcset, content-hashed URL).
    cover: z.string(),
    draft: z.boolean().optional().default(false),
    /** Set false to hide the comments section for a specific post. */
    comments: z.boolean().optional().default(true),
  }),
});

// Static page bodies (currently only About) that vary per language.
// One entry per language: id = "en", "zh", …
const about = defineCollection({
  loader: glob({ pattern: '*.{md,mdx}', base: './src/content/about' }),
  schema: z.object({
    title: z.string(),
    intro: z.string(),
  }),
});

export const collections = { posts, about };
