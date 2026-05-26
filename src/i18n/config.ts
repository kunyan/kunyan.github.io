export const languages = ['en', 'zh'] as const;
export type Lang = (typeof languages)[number];

export const defaultLang: Lang = 'zh';

export const languageMeta: Record<
  Lang,
  { name: string; short: string; htmlLang: string; locale: string }
> = {
  en: { name: 'English', short: 'EN', htmlLang: 'en', locale: 'en-US' },
  zh: { name: '中文', short: '中', htmlLang: 'zh-CN', locale: 'zh-CN' },
};

export function isLang(value: string | undefined): value is Lang {
  return value === 'en' || value === 'zh';
}
