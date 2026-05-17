import type { Lang } from '../i18n/config';

// Fill these in once you've enabled Discussions on your repo, installed the
// Giscus GitHub App, and run https://giscus.app/ to get the IDs.
// Until repoId + categoryId are non-empty, the <Comments /> component renders a
// configuration hint instead of mounting the Giscus iframe.
export const giscusConfig = {
  repo: 'kunyan/kunyan.github.io',
  repoId: 'R_kgDOHgAUjg',
  category: 'Announcements',
  categoryId: 'DIC_kwDOHgAUjs4CcJ6n',
  mapping: 'pathname',
  strict: '0',
  reactionsEnabled: '1',
  emitMetadata: '0',
  inputPosition: 'top',
  loading: 'lazy',
} as const;

export function isConfigured(): boolean {
  return !!giscusConfig.repoId && !!giscusConfig.categoryId;
}

/** Map our two-letter lang code to Giscus's UI language codes. */
export function giscusLang(lang: Lang): string {
  return lang === 'zh' ? 'zh-CN' : 'en';
}
