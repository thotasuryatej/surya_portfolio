import { useId } from 'react';
import './monogram.css';

/**
 * The ST identity mark (same geometry as public/brand/st-mark.svg): a microcontroller package with
 * pins on all four sides, and the letters routed inside it as PCB traces —
 * S as a 45°-chamfered trace ending on a pad, T as a bus with its stem dropping to a via.
 * Colours come from --logo-1/2/3 and --logo-pkg/--logo-pin so the mark follows the theme;
 * `animated` powers it up once (package, pins, then the traces).
 */
export function Monogram({ size = 32, title, animated = false }: { size?: number; title?: string; animated?: boolean }) {
  const id = useId();
  const ink = `url(#${id}-g)`;
  return (
    <svg
      className={`mono-mark${animated ? ' mono-mark--draw' : ''}`}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <defs>
        <linearGradient id={`${id}-g`} x1="10" y1="10" x2="38" y2="38" gradientUnits="userSpaceOnUse">
          <stop style={{ stopColor: 'var(--logo-1)' }} />
          <stop offset=".5" style={{ stopColor: 'var(--logo-2)' }} />
          <stop offset="1" style={{ stopColor: 'var(--logo-3)' }} />
        </linearGradient>
      </defs>
      <path
        className="mm-pins"
        stroke="var(--logo-pin)"
        strokeWidth="2.4"
        strokeLinecap="round"
        d="M17 3.5V7M24 3.5V7M31 3.5V7M17 41V44.5M24 41V44.5M31 41V44.5M3.5 17H7M3.5 24H7M3.5 31H7M41 17H44.5M41 24H44.5M41 31H44.5"
      />
      <rect className="mm-chip" x="7" y="7" width="34" height="34" rx="8.5" fill="var(--logo-pkg)" stroke={ink} strokeWidth="2.2" pathLength={1} />
      <g stroke={ink} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
        <path className="mm-trace mm-s" d="M22.5 14H16.5L13.5 17V20.5L16 23H20L22.5 25.5V31L19.5 34H14.5" pathLength={1} />
        <path className="mm-trace mm-t" d="M25.5 14H35M30.25 14V30.5" pathLength={1} />
      </g>
      <circle className="mm-via" cx="30.25" cy="33.6" r="2.3" stroke={ink} strokeWidth="2.1" />
      <circle className="mm-via" cx="12.4" cy="34" r="2.1" fill={ink} />
    </svg>
  );
}
