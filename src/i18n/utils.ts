import { getCollection, type CollectionEntry } from 'astro:content';
import { defaultLang, isLang, languageMeta, type Lang } from './config';

export type PostEntry = CollectionEntry<'posts'>;

/** post.id is e.g. "en/react-server-components"; this returns "en". */
export function postLang(post: PostEntry): Lang {
  const seg = post.id.split('/')[0];
  return isLang(seg) ? seg : defaultLang;
}

/** post.id is e.g. "en/react-server-components"; this returns "react-server-components". */
export function postSlug(post: PostEntry): string {
  return post.id.split('/').slice(1).join('/');
}

export function postHref(post: PostEntry): string {
  return `/${postLang(post)}/posts/${postSlug(post)}/`;
}

export async function getPostsByLang(lang: Lang): Promise<PostEntry[]> {
  const all = await getCollection('posts', ({ data }) => !data.draft);
  return all.filter((p) => postLang(p) === lang).sort((a, b) => +b.data.date - +a.data.date);
}

/** Find the translation of `post` in `otherLang`, by matching slug. */
export async function getCounterpart(post: PostEntry, otherLang: Lang): Promise<PostEntry | null> {
  const slug = postSlug(post);
  const all = await getCollection('posts');
  return all.find((p) => postLang(p) === otherLang && postSlug(p) === slug) ?? null;
}

/** Prefix a path with the language segment, ensuring exactly one leading slash. */
export function localizedPath(lang: Lang, path = '/'): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (clean === '/') return `/${lang}/`;
  return `/${lang}${clean}`;
}

export function formatDate(date: Date, lang: Lang = defaultLang): string {
  const locale = languageMeta[lang].locale;
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: lang === 'en' ? 'short' : 'long',
    day: 'numeric',
  });
}

/** Choose singular/plural string key based on count. Chinese has no plural. */
export function pluralKey<TBase extends string>(
  base: TBase,
  n: number,
): `${TBase}One` | `${TBase}Many` {
  return n === 1 ? `${base}One` : `${base}Many`;
}

// --- Reading time ---------------------------------------------------------
// Roughly conservative comfort speeds; bump these if your audience reads faster.
const WORDS_PER_MIN_EN = 200;
const CHARS_PER_MIN_ZH = 320;

/** Strip frontmatter, code blocks, markdown syntax, and HTML from a body. */
function stripMarkdown(body: string): string {
  return body
    .replace(/^---[\s\S]*?\n---/, '') // YAML frontmatter (if present)
    .replace(/```[\s\S]*?```/g, ' ') // fenced code blocks
    .replace(/`[^`]*`/g, ' ') // inline code
    .replace(/<[^>]+>/g, ' ') // HTML tags
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ') // images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links → keep visible text
    .replace(/[#>*_~`|]/g, ' '); // common markdown markers
}

/** Compute reading time in whole minutes (floor 1) from a markdown body. */
export function computeReadingMinutes(body: string, lang: Lang): number {
  const text = stripMarkdown(body);
  if (lang === 'zh') {
    const chars = (text.match(/[一-鿿]/g) ?? []).length;
    return Math.max(1, Math.round(chars / CHARS_PER_MIN_ZH));
  }
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MIN_EN));
}

/** Localized "N min" / "N 分钟" string for a post — manual frontmatter overrides if set. */
export function getReadingTime(post: PostEntry): string {
  const manual = post.data.readingTime;
  if (manual) return manual;
  const lang = postLang(post);
  const minutes = computeReadingMinutes(post.body ?? '', lang);
  return lang === 'zh' ? `${minutes} 分钟` : `${minutes} min`;
}
