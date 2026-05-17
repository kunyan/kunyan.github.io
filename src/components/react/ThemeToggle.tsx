import { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '../../lib/cn';

type Theme = 'light' | 'dark' | 'system';

interface Labels {
  toggle: string;
  light: string;
  dark: string;
  system: string;
}

function resolveDark(theme: Theme): boolean {
  if (theme === 'dark') return true;
  if (theme === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function apply(theme: Theme) {
  document.documentElement.classList.toggle('dark', resolveDark(theme));
}

export default function ThemeToggle({ labels }: { labels: Labels }) {
  const [theme, setTheme] = useState<Theme>('system');
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setTheme(saved);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => apply('system');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const select = (t: Theme) => {
    setTheme(t);
    apply(t);
    try {
      localStorage.setItem('theme', t);
    } catch {}
    setOpen(false);
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={labels.toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground lg:h-9 lg:w-9"
      >
        <Icon icon="lucide:sun" width={16} height={16} className="block dark:hidden" />
        <Icon icon="lucide:moon" width={16} height={16} className="hidden dark:block" />
      </button>

      {open && (
        <div
          role="menu"
          aria-label={labels.toggle}
          className="absolute top-full right-0 z-50 mt-1 min-w-[9rem] overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md"
        >
          <MenuItem
            label={labels.light}
            active={theme === 'light'}
            onSelect={() => select('light')}
            iconName="lucide:sun"
          />
          <MenuItem
            label={labels.dark}
            active={theme === 'dark'}
            onSelect={() => select('dark')}
            iconName="lucide:moon"
          />
          <MenuItem
            label={labels.system}
            active={theme === 'system'}
            onSelect={() => select('system')}
            iconName="lucide:monitor"
          />
        </div>
      )}
    </div>
  );
}

function MenuItem({
  iconName,
  label,
  active,
  onSelect,
}: {
  iconName: string;
  label: string;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
        active ? 'text-foreground' : 'text-muted-foreground',
      )}
    >
      <span className="inline-flex h-4 w-4 items-center justify-center">
        <Icon icon={iconName} width={14} height={14} />
      </span>
      <span className="flex-1 text-left">{label}</span>
      {active && <Icon icon="lucide:check" width={13} height={13} />}
    </button>
  );
}
