import type { LucideProps } from 'lucide-react';
import { CircleDot } from 'lucide-react';
import { iconMap } from './icons';

/** Renders a Lucide icon by name. Decorative by default (aria-hidden). */
export function Icon({ name, ...props }: { name: string } & LucideProps) {
  const C = iconMap[name] ?? CircleDot;
  return <C aria-hidden="true" strokeWidth={1.75} {...props} />;
}
