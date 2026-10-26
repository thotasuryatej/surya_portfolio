import { useRef, type AnchorHTMLAttributes, type ReactNode } from 'react';
import { useMagnetic, usePointerLight } from '../../hooks/usePointerLight';

type Variant = 'primary' | 'glass' | 'ghost';

interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: Variant;
  size?: 'md' | 'sm';
  icon?: ReactNode;
  iconEnd?: ReactNode;
  magnetic?: boolean;
}

/** A link styled as a button. All site buttons that navigate use this. */
export function ButtonLink({
  variant = 'glass',
  size = 'md',
  icon,
  iconEnd,
  magnetic = true,
  className = '',
  children,
  ...rest
}: ButtonLinkProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  useMagnetic(ref, magnetic);
  usePointerLight(ref, variant === 'glass');
  const cls = [
    'btn',
    `btn--${variant}`,
    variant === 'glass' && 'glass glass--thin',
    size === 'sm' && 'btn--sm',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <a ref={ref} className={cls} {...rest}>
      {icon}
      <span>{children}</span>
      {iconEnd}
    </a>
  );
}
