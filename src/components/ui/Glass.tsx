import { useRef, type ElementType, type ComponentPropsWithoutRef } from 'react';
import { usePointerLight } from '../../hooks/usePointerLight';
import { useLiquidGlass } from './LiquidGlass';

type GlassProps<T extends ElementType> = {
  as?: T;
  variant?: 'regular' | 'thin' | 'strong';
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'className'>;

/** A Liquid Glass surface with a pointer-following specular highlight and a refracting rim. See styles/glass.css. */
export function Glass<T extends ElementType = 'div'>({
  as,
  variant = 'regular',
  className = '',
  ...rest
}: GlassProps<T>) {
  const Tag = (as ?? 'div') as ElementType;
  const ref = useRef<HTMLElement>(null);
  usePointerLight(ref);
  const liquid = useLiquidGlass(ref);
  const cls = ['glass', variant !== 'regular' && `glass--${variant}`, className]
    .filter(Boolean)
    .join(' ');
  return (
    <>
      {liquid}
      <Tag ref={ref} className={cls} {...rest} />
    </>
  );
}
