import { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '../../lib/cn';

export interface LangOption {
  code: string;
  /** Display name, e.g. "English" / "中文". */
  label: string;
  /** Short badge, e.g. "EN" / "中". */
  short: string;
  /** Where to send the user when this option is picked (counterpart or fallback). */
  href: string;
}

interface Props {
  current: string;
  options: LangOption[];
  toggleLabel: string;
}

export default function LanguageSwitcher({ current, options, toggleLabel }: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

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

  const select = (opt: LangOption) => {
    setOpen(false);
    try {
      localStorage.setItem('preferredLang', opt.code);
    } catch {}
    if (opt.code === current) return;
    window.location.href = opt.href;
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={toggleLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground lg:h-9 lg:w-9"
      >
        <Icon icon="lucide:languages" width={16} height={16} />
      </button>

      {open && (
        <div
          role="menu"
          aria-label={toggleLabel}
          className="absolute top-full right-0 z-50 mt-1 min-w-36 overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md"
        >
          {options.map((opt) => (
            <MenuItem
              key={opt.code}
              label={opt.label}
              short={opt.short}
              active={opt.code === current}
              onSelect={() => select(opt)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MenuItem({
  label,
  short,
  active,
  onSelect,
}: {
  label: string;
  short: string;
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
      <span className="inline-flex h-4 w-4 items-center justify-center font-semibold text-[10px] leading-none">
        {short}
      </span>
      <span className="flex-1 text-left">{label}</span>
      {active && <Icon icon="lucide:check" width={13} height={13} />}
    </button>
  );
}
