import { useEffect, useState } from 'react';
import { cn } from '../../lib/cn';

interface Heading {
  slug: string;
  text: string;
  depth: number;
}

interface Props {
  headings: Heading[];
  label: string;
}

export default function Toc({ headings, label }: Props) {
  const items = headings.filter((h) => h.depth === 2 || h.depth === 3);
  const [activeId, setActiveId] = useState<string | null>(items[0]?.slug ?? null);

  useEffect(() => {
    if (items.length === 0) return;
    const ids = items.map((h) => h.slug);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!elements.length) return;

    const compute = () => {
      const anchorY = window.innerHeight * 0.25;
      let best = elements[0].id;
      let bestTop = -Infinity;
      for (const el of elements) {
        const top = el.getBoundingClientRect().top;
        if (top <= anchorY && top > bestTop) {
          bestTop = top;
          best = el.id;
        }
      }
      setActiveId(best);
    };

    const observer = new IntersectionObserver(compute, {
      rootMargin: '0px 0px -60% 0px',
      threshold: [0, 1],
    });
    elements.forEach((el) => observer.observe(el));

    window.addEventListener('scroll', compute, { passive: true });
    compute();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', compute);
    };
  }, [items]);

  if (items.length === 0) return null;

  const onJump = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top, behavior: 'smooth' });
    history.replaceState(null, '', `#${id}`);
  };

  return (
    <nav aria-label={label} className="text-sm">
      <p className="mb-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
        {label}
      </p>
      <ul className="space-y-0.5 border-border border-l">
        {items.map((it) => {
          const active = it.slug === activeId;
          return (
            <li key={it.slug}>
              <a
                href={`#${it.slug}`}
                onClick={(e) => onJump(e, it.slug)}
                className={cn(
                  'relative -ml-px block border-l py-1.5 pl-3 transition-colors',
                  it.depth === 3 && 'pl-6',
                  active
                    ? 'border-foreground text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                {it.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
