import { ST_FOLD, ST_LETTERS, ST_PADS, ST_TRACES, ST_VIEW } from './stPaths';
import './monogram.css';

/**
 * The ST logo (same geometry as public/brand/st-mark.svg): angular S and T letterforms, the copper edge of
 * the S's fold, and two circuit traces running out to pads.
 * Colours come from --logo-ink and --logo-copper so the mark follows the theme. `size` is its height;
 * small sizes thicken the traces so they still read. `animated` powers it up once (letters, then the traces).
 */
export function Markers({ size }: { size: number }) {
  // Traces at least about a pixel wide on screen
  const sw = Math.max(1.1, (0.9 * ST_VIEW.h) / size);
  return (
    <>
      <path className="mm-trace" d={ST_TRACES} stroke="var(--logo-copper)" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill="none" pathLength={1} />
      {ST_PADS.map(([cx, cy]) => (
        <circle key={cx} className="mm-pad" cx={cx} cy={cy} r={sw * 1.25 + 1.2} fill="var(--logo-copper)" />
      ))}
    </>
  );
}

export function Monogram({ size = 32, title, animated = false }: { size?: number; title?: string; animated?: boolean }) {
  return (
    <svg
      className={`mono-mark${animated ? ' mono-mark--draw' : ''}`}
      width={(size * ST_VIEW.w) / ST_VIEW.h}
      height={size}
      viewBox={`0 0 ${ST_VIEW.w} ${ST_VIEW.h}`}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <Markers size={size} />
      <path className="mm-fold" d={ST_FOLD} fill="var(--logo-copper)" />
      <path className="mm-letters" d={ST_LETTERS} fill="var(--logo-ink)" />
    </svg>
  );
}
