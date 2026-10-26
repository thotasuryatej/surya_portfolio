import type { CSSProperties, ReactNode } from 'react';

export function Badge({ color, live, children }: { color: string; live?: boolean; children: ReactNode }) {
  return (
    <span className="badge" style={{ '--badge': color } as CSSProperties}>
      <span className={`badge-dot${live ? ' is-live' : ''}`} aria-hidden="true" />
      {children}
    </span>
  );
}

export function TagList({ items, label, max }: { items: string[]; label?: string; max?: number }) {
  const shown = max ? items.slice(0, max) : items;
  const rest = items.length - shown.length;
  return (
    <ul className="tag-list" aria-label={label}>
      {shown.map((t) => (
        <li key={t} className="tag">
          {t}
        </li>
      ))}
      {rest > 0 && (
        <li className="tag" aria-label={`and ${rest} more`}>
          +{rest}
        </li>
      )}
    </ul>
  );
}
