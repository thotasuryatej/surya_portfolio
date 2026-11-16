import { useId } from 'react';
import { ST_BAND_STOPS, ST_DEPTH, ST_PATH, ST_SIDE, ST_STROKE, ST_VIEW } from './stPaths';
import './monogram.css';

/**
 * The ST logo: polished copper letters with a clear glass coat (same design as public/brand/st-mark.svg and
 * the icons). The face bands come from --logo-band-0..6 so the copper reads on both themes.
 * `StArt` draws it in the 512 artboard's units, to place inside another SVG; `Monogram` is the standalone mark.
 */
export function StArt({ steps = 10 }: { steps?: number }) {
  const id = useId().replace(/[^\w-]/g, '');
  const side = Array.from({ length: steps }, (_, i) => {
    const k = steps - i;
    const t = Math.pow(k / steps, 0.8);
    const c = ST_SIDE[0].map((v, j) => Math.round(v + (ST_SIDE[1][j] - v) * t));
    return { k, c };
  });
  return (
    <>
      <defs>
        <linearGradient id={`${id}-face`} gradientUnits="userSpaceOnUse" x1="90" y1="110" x2="430" y2="410">
          {ST_BAND_STOPS.map((o, i) => (
            <stop key={o} offset={o} style={{ stopColor: `var(--logo-band-${i})` }} />
          ))}
        </linearGradient>
        <linearGradient id={`${id}-sheen`} gradientUnits="userSpaceOnUse" x1="150" y1="110" x2="330" y2="330">
          <stop offset=".38" stopColor="#fff" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".6" />
          <stop offset=".62" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g fill="none" strokeWidth={ST_STROKE}>
        {side.map(({ k, c }) => (
          <path
            key={k}
            d={ST_PATH}
            stroke={`rgb(${c.join(',')})`}
            transform={`translate(${((k / steps) * ST_DEPTH.dx).toFixed(2)} ${((k / steps) * ST_DEPTH.dy).toFixed(2)})`}
          />
        ))}
        <path d={ST_PATH} stroke={`url(#${id}-face)`} />
        {/* Glass coat: a bright wet edge, the copper face inside it, and a highlight sweeping across */}
        <path d={ST_PATH} stroke="#fff" strokeOpacity=".45" />
        <path d={ST_PATH} stroke={`url(#${id}-face)`} strokeWidth={ST_STROKE - 9} />
        <path d={ST_PATH} stroke={`url(#${id}-sheen)`} strokeWidth={ST_STROKE - 9} />
      </g>
    </>
  );
}

export function Monogram({ size = 32, title }: { size?: number; title?: string }) {
  return (
    <svg
      className="mono-mark"
      width={(size * ST_VIEW.w) / ST_VIEW.h}
      height={size}
      viewBox={`${ST_VIEW.x} ${ST_VIEW.y} ${ST_VIEW.w} ${ST_VIEW.h}`}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <StArt />
    </svg>
  );
}
