import { useEffect, useRef, useState } from 'react';
import { giscusConfig, giscusLang, isConfigured } from '../../lib/giscus';

interface Props {
  lang: 'en' | 'zh';
}

type GiscusTheme = 'light' | 'dark';

function readTheme(): GiscusTheme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

export default function Comments({ lang }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<GiscusTheme>('light');

  // Read the initial theme + observe future changes to <html class>
  // (the ThemeToggle and the system-preference listener both toggle that class).
  useEffect(() => {
    setTheme(readTheme());
    const observer = new MutationObserver(() => setTheme(readTheme()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  // Inject the Giscus script once on mount. Idempotent across re-renders.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !isConfigured()) return;

    el.innerHTML = ''; // clear any previous mount (HMR safety)

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.setAttribute('data-repo', giscusConfig.repo);
    script.setAttribute('data-repo-id', giscusConfig.repoId);
    script.setAttribute('data-category', giscusConfig.category);
    script.setAttribute('data-category-id', giscusConfig.categoryId);
    script.setAttribute('data-mapping', giscusConfig.mapping);
    script.setAttribute('data-strict', giscusConfig.strict);
    script.setAttribute('data-reactions-enabled', giscusConfig.reactionsEnabled);
    script.setAttribute('data-emit-metadata', giscusConfig.emitMetadata);
    script.setAttribute('data-input-position', giscusConfig.inputPosition);
    script.setAttribute('data-theme', theme);
    script.setAttribute('data-lang', giscusLang(lang));
    script.setAttribute('data-loading', giscusConfig.loading);

    el.appendChild(script);

    return () => {
      el.innerHTML = '';
    };
    // We intentionally don't depend on `theme` here — initial theme is fine and
    // subsequent changes go through postMessage below, no iframe reload needed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // Re-theme the iframe live without rebuilding it.
  useEffect(() => {
    if (!isConfigured()) return;
    const iframe = document.querySelector<HTMLIFrameElement>('iframe.giscus-frame');
    if (!iframe) return;
    iframe.contentWindow?.postMessage({ giscus: { setConfig: { theme } } }, 'https://giscus.app');
  }, [theme]);

  if (!isConfigured()) {
    return (
      <div className="rounded-lg border border-border border-dashed bg-muted/30 p-6 text-center">
        <p className="text-muted-foreground text-sm">
          Comments aren&apos;t configured yet. Fill in{' '}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">repoId</code> and{' '}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">categoryId</code> in{' '}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
            src/lib/giscus.ts
          </code>
          .
        </p>
      </div>
    );
  }

  return <div ref={containerRef} className="giscus" />;
}
