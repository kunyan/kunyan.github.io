import { defaultLang, type Lang } from './config';

// English-shaped dictionary. zh below must satisfy the same key shape.
const en = {
  // nav
  'nav.home': 'Home',
  'nav.posts': 'Posts',
  'nav.about': 'About',
  'nav.rss': 'RSS feed',
  'nav.github': 'GitHub',
  'nav.openMenu': 'Open menu',
  'nav.closeMenu': 'Close menu',
  'nav.language': 'Language',
  'nav.switchLanguage': 'Switch language',
  'nav.translationMissing': 'No translation available — going to homepage',

  // theme
  'theme.toggle': 'Toggle theme',
  'theme.light': 'Light',
  'theme.dark': 'Dark',
  'theme.system': 'System',

  // hero
  'hero.newPost': 'New post',
  'hero.subtitle': 'Essays and notes on software engineering, tools, and building things.',

  // home
  'home.viewAll': 'View all {n} posts',

  // archive header
  'archive.kicker': 'The archive',
  'archive.title': 'All posts',
  'archive.summary':
    '{n} essays and notes on engineering, tools, and the work of thinking clearly.',

  // posts explorer
  'posts.countOne': '{n} post',
  'posts.countMany': '{n} posts',
  'posts.filters': 'Filters',
  'posts.search': 'Search',
  'posts.searchPlaceholder': 'Title or excerpt…',
  'posts.tags': 'Tags',
  'posts.date': 'Date',
  'posts.dateAll': 'All time',
  'posts.dateWeek': 'Last week',
  'posts.dateMonth': 'Last month',
  'posts.dateYear': 'Last year',
  'posts.clearFilters': 'Clear filters',
  'posts.clearFiltersWithCount': 'Clear filters ({n})',
  'posts.clearAll': 'Clear all',
  'posts.galleryView': 'Gallery view',
  'posts.listView': 'List view',
  'posts.sortLabel': 'Sort posts',
  'posts.sortNewest': 'Newest first',
  'posts.sortOldest': 'Oldest first',
  'posts.sortShortest': 'Shortest read',
  'posts.sortLongest': 'Longest read',
  'posts.empty': 'No posts match',
  'posts.emptyHint': 'Try removing a filter or broadening the date range.',
  'posts.showOne': 'Show 1 post',
  'posts.showMany': 'Show {n} posts',
  'posts.pagination': 'Pagination',
  'posts.previous': 'Previous',
  'posts.next': 'Next',
  'posts.previousPage': 'Previous page',
  'posts.nextPage': 'Next page',
  'posts.removeFilter': 'Remove {label}',
  'posts.readSuffix': 'read',

  // post detail
  'post.backToAll': 'All posts',
  'post.previous': 'Previous',
  'post.next': 'Next',
  'post.toc': 'On this page',
  'post.backToTop': 'Back to top',
  'post.comments': 'Comments',
  'post.notFound': 'Post not found',
  'post.notFoundHint': "We couldn't find a post with id {id}.",

  // footer
  'footer.tagline': 'Built quietly, on weekends.',
  'footer.rss': 'RSS',
  'footer.github': 'GitHub',
  'footer.email': 'Email',
  'footer.strava': 'Strava',

  // 404
  '404.title': 'Page not found',
  '404.hint': "The page you're looking for doesn't exist.",
  '404.cta': 'Back to home',

  // misc
  'meta.siteName': "Kun's Notes",
  'meta.tagline': 'Thoughts on code, craft, and everything in between',
  'meta.description': 'Essays and notes on software engineering, tools, and building things.',
} as const;

type UIKey = keyof typeof en;

const zh: Record<UIKey, string> = {
  'nav.home': '首页',
  'nav.posts': '文章',
  'nav.about': '关于',
  'nav.rss': 'RSS 订阅',
  'nav.github': 'GitHub',
  'nav.openMenu': '打开菜单',
  'nav.closeMenu': '关闭菜单',
  'nav.language': '语言',
  'nav.switchLanguage': '切换语言',
  'nav.translationMissing': '此页面没有对应翻译，已返回首页',

  'theme.toggle': '切换主题',
  'theme.light': '浅色',
  'theme.dark': '深色',
  'theme.system': '跟随系统',

  'hero.newPost': '最新',
  'hero.subtitle': '关于软件工程、工具与构建之事的随笔笔记。',

  'home.viewAll': '查看全部 {n} 篇文章',

  'archive.kicker': '文章档案',
  'archive.title': '全部文章',
  'archive.summary': '{n} 篇关于工程、工具和清晰思考的文字。',

  'posts.countOne': '{n} 篇',
  'posts.countMany': '{n} 篇',
  'posts.filters': '筛选',
  'posts.search': '搜索',
  'posts.searchPlaceholder': '标题或摘要…',
  'posts.tags': '标签',
  'posts.date': '日期',
  'posts.dateAll': '全部时间',
  'posts.dateWeek': '一周内',
  'posts.dateMonth': '一月内',
  'posts.dateYear': '一年内',
  'posts.clearFilters': '清除筛选',
  'posts.clearFiltersWithCount': '清除筛选（{n}）',
  'posts.clearAll': '全部清除',
  'posts.galleryView': '卡片视图',
  'posts.listView': '列表视图',
  'posts.sortLabel': '排序方式',
  'posts.sortNewest': '最新优先',
  'posts.sortOldest': '最早优先',
  'posts.sortShortest': '最短阅读',
  'posts.sortLongest': '最长阅读',
  'posts.empty': '没有匹配的文章',
  'posts.emptyHint': '试着移除某个筛选或放宽日期范围。',
  'posts.showOne': '显示 1 篇',
  'posts.showMany': '显示 {n} 篇',
  'posts.pagination': '分页',
  'posts.previous': '上一页',
  'posts.next': '下一页',
  'posts.previousPage': '上一页',
  'posts.nextPage': '下一页',
  'posts.removeFilter': '移除 {label}',
  'posts.readSuffix': '阅读',

  'post.backToAll': '返回文章列表',
  'post.previous': '上一篇',
  'post.next': '下一篇',
  'post.toc': '本页目录',
  'post.backToTop': '回到顶部',
  'post.comments': '评论',
  'post.notFound': '找不到这篇文章',
  'post.notFoundHint': '我们没有找到 id 为 {id} 的文章。',

  'footer.tagline': '业余时间，一顿瞎写。',
  'footer.rss': 'RSS',
  'footer.github': 'GitHub',
  'footer.email': '邮箱',
  'footer.strava': 'Strava',

  '404.title': '页面未找到',
  '404.hint': '你访问的页面不存在。',
  '404.cta': '返回首页',

  'meta.siteName': "Kun's Notes",
  'meta.tagline': '关于代码、工艺和之间一切的思考',
  'meta.description': '关于软件工程、工具与构建之事的随笔笔记。',
};

export const ui: Record<Lang, Record<UIKey, string>> = { en, zh };

// Hero title segments — animated word-by-word, so different segmentations per language.
export const heroTitleSegments: Record<Lang, string[]> = {
  en: ['Thoughts', 'on', 'code,', 'craft,', 'and', 'everything', 'in', 'between.'],
  zh: ['Thoughts', 'on', 'code,', 'craft,', 'and', 'everything', 'in', 'between.'],
};
// How many leading segments belong to the first line (visual break after this index on >=sm).
export const heroTitleBreakAfter: Record<Lang, number> = {
  en: 4,
  zh: 4,
};

export function t(lang: Lang, key: UIKey, params: Record<string, string | number> = {}): string {
  const currentLang = lang || defaultLang;
  const raw = ui[currentLang][key];
  return Object.entries(params).reduce((s, [k, v]) => s.replace(`{${k}}`, String(v)), raw);
}

export type { UIKey };
