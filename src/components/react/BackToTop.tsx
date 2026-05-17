import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '../../lib/cn';

interface Props {
  label: string;
}

export default function BackToTop({ label }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label={label}
      className={cn(
        'fixed right-6 bottom-6 z-40 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/90 text-foreground shadow-sm backdrop-blur transition-all duration-200 hover:bg-accent',
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0',
      )}
    >
      <Icon icon="lucide:arrow-up" width={16} height={16} />
    </button>
  );
}
