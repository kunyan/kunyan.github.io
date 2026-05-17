import rss from '@astrojs/rss';
import type { APIContext, GetStaticPaths } from 'astro';
import { languages, isLang } from '../../i18n/config';
import { t } from '../../i18n/ui';
import { getPostsByLang, postHref } from '../../i18n/utils';

export const getStaticPaths = (() =>
  languages.map((lang) => ({ params: { lang } }))) satisfies GetStaticPaths;

export async function GET(context: APIContext) {
  const lang = context.params.lang;
  if (!isLang(lang)) throw new Error(`Invalid lang param: ${lang}`);

  const posts = await getPostsByLang(lang);

  return rss({
    title: t(lang, 'meta.siteName'),
    description: t(lang, 'meta.description'),
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.excerpt,
      pubDate: post.data.date,
      link: postHref(post),
      categories: post.data.tags,
    })),
    customData: `<language>${lang === 'zh' ? 'zh-cn' : 'en-us'}</language>`,
  });
}
