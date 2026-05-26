// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import icon from 'astro-icon';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://yankun.org',
  integrations: [
    react(),
    mdx(),
    icon(),
    sitemap({
      i18n: {
        defaultLocale: 'zh',
        locales: { zh: 'zh-CN', en: 'en' },
      },
      // Skip the unprefixed root (its canonical is /zh/), 404, and RSS endpoints.
      filter: (page) => {
        const path = new URL(page).pathname;
        if (path === '/' || path === '/404' || path === '/404/') return false;
        if (path.endsWith('/rss.xml')) return false;
        return true;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
    },
  },
  // Self-host Inter (body) and JetBrains Mono (code) via Astro's font pipeline.
  // Subset to weights we actually use; sets font-display: swap + metric-matched
  // fallbacks (CLS-safe).
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Inter',
      cssVariable: '--astro-font-inter',
      weights: ['400', '500', '600', '700'],
      styles: ['normal'],
    },
    {
      provider: fontProviders.google(),
      name: 'JetBrains Mono',
      cssVariable: '--astro-font-jetbrains-mono',
      weights: ['400', '500'],
      styles: ['normal'],
    },
  ],
});
