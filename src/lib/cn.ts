import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combine class names with clsx semantics and resolve Tailwind conflicts via
 * tailwind-merge. Use everywhere we conditionally compose classes in React
 * components so Biome's class sorter can do its job.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
