import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '../../lib/cn';

interface Link {
  label: string;
  href: string;
}

interface Labels {
  open: string;
  close: string;
}

interface Props {
  links: Link[];
  pathname: string;
  labels: Labels;
}

export default function MobileMenu({ links, pathname, labels }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const isActive = (href: string) => {
    const target = href.replace(/\/$/, '') || '/';
    return pathname === target || pathname.startsWith(target + '/');
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? labels.close : labels.open}
        aria-expanded={open}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground lg:hidden"
      >
        <Icon icon={open ? 'lucide:x' : 'lucide:menu'} width={18} height={18} />
      </button>

      {open && (
        <div className="fixed inset-x-0 top-14 z-40 border-border border-t bg-background lg:hidden">
          <nav className="container flex flex-col gap-0.5 py-3">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'min-h-11 rounded-md px-3 py-3 text-sm transition-colors',
                  isActive(l.href)
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )}
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
