import { useId, useMemo, useRef, useState, type CSSProperties } from 'react';
import type { HeroNode } from '../../content/schema';
import { Icon } from '../ui/Icon';
import { Badge } from '../ui/Badge';
import { evidenceColor, evidenceLabel } from '../../lib/status';
import { useInView } from '../../hooks/useInView';
import './circuit-core.css';

/*
 * The hero's signature visual: a microcontroller "core" with PCB traces routed at
 * 45° to each of the things I work on. Traces are computed, not drawn by hand, so
 * adding or removing a node in src/content/hero.ts re-routes the board.
 * On load the traces draw out, then the chip flickers on like a bench supply being
 * switched in; after that a slow scan beam sweeps the board and each node answers
 * as the beam passes it.
 */

const SIZE = 600;
const C = SIZE / 2;
const CHIP = 70; // half-size of the chip package
const PIN = 10;
const ORBIT = 226;

type Pt = { x: number; y: number };

function route(theta: number): { d: string; node: Pt; pinSide: 'x' | 'y'; sign: number } {
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  const node = { x: C + ORBIT * cos, y: C + ORBIT * sin };
  const xDominant = Math.abs(cos) >= Math.abs(sin);
  const sign = Math.sign(xDominant ? cos : sin) || 1;
  const off = Math.max(-46, Math.min(46, (xDominant ? sin : cos) * 52));
  const p0 = xDominant ? { x: C + sign * (CHIP + PIN), y: C + off } : { x: C + off, y: C + sign * (CHIP + PIN) };
  const p1 = xDominant ? { x: p0.x + sign * 22, y: p0.y } : { x: p0.x, y: p0.y + sign * 22 };
  const dx = node.x - p1.x;
  const dy = node.y - p1.y;
  // 45° diagonal for the minor axis, then a straight run into the node.
  const diag = Math.min(Math.abs(dx), Math.abs(dy));
  const p2 = { x: p1.x + Math.sign(dx) * diag, y: p1.y + Math.sign(dy) * diag };
  const f = (p: Pt) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  return { d: `M${f(p0)} L${f(p1)} L${f(p2)} L${f(node)}`, node, pinSide: xDominant ? 'x' : 'y', sign };
}

/** Short decorative stubs ending in vias, so the board feels populated. */
function stubs(): { d: string; via: Pt }[] {
  const out: { d: string; via: Pt }[] = [];
  const offsets = [-56, -24, 8, 40];
  const lens = [34, 56, 26, 44];
  for (let side = 0; side < 4; side++) {
    offsets.forEach((o, i) => {
      const len = lens[(i + side) % 4];
      const s = side < 2 ? 1 : -1;
      const horiz = side % 2 === 0;
      const start = horiz ? { x: C + s * (CHIP + PIN), y: C + o } : { x: C + o, y: C + s * (CHIP + PIN) };
      const end = horiz ? { x: start.x + s * len, y: start.y + (i % 2 ? 12 : -12) } : { x: start.x + (i % 2 ? 12 : -12), y: start.y + s * len };
      const mid = horiz ? { x: end.x - s * 12, y: start.y } : { x: start.x, y: end.y - s * 12 };
      out.push({ d: `M${start.x} ${start.y} L${mid.x} ${mid.y} L${end.x} ${end.y}`, via: end });
    });
  }
  return out;
}

export function CircuitCore({ nodes }: { nodes: HeroNode[] }) {
  const uid = useId().replace(/:/g, '');
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const inView = useInView(wrap);
  const active = hovered ?? selected;

  const routes = useMemo(() => {
    const step = (Math.PI * 2) / nodes.length;
    // angle: degrees clockwise from 12 o'clock, so the scan beam knows when it passes the node
    return nodes.map((n, i) => ({ ...n, angle: ((step * i + step / 2) * 180) / Math.PI, ...route(-Math.PI / 2 + step * i + step / 2) }));
  }, [nodes]);
  const decor = useMemo(stubs, []);
  const current = routes.find((r) => r.id === (selected ?? hovered)) ?? null;

  const pins = useMemo(() => {
    const list: { x: number; y: number; w: number; h: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const o = -48 + i * 16;
      list.push({ x: C + o - 3, y: C - CHIP - PIN, w: 6, h: PIN });
      list.push({ x: C + o - 3, y: C + CHIP, w: 6, h: PIN });
      list.push({ x: C - CHIP - PIN, y: C + o - 3, w: PIN, h: 6 });
      list.push({ x: C + CHIP, y: C + o - 3, w: PIN, h: 6 });
    }
    return list;
  }, []);

  return (
    <div className="core" ref={wrap} data-paused={!inView || undefined}>
      <div className="core-stage">
        <svg className="core-svg" viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true">
          <defs>
            <radialGradient id={`${uid}-halo`}>
              <stop offset="0" style={{ stopColor: 'var(--cyan)' }} stopOpacity=".22" />
              <stop offset=".45" style={{ stopColor: 'var(--halo-2)' }} stopOpacity=".07" />
              <stop offset="1" style={{ stopColor: 'var(--bg)' }} stopOpacity="0" />
            </radialGradient>
            <radialGradient id={`${uid}-lens`} cx=".35" cy=".25" r=".9">
              <stop offset="0" style={{ stopColor: 'rgb(var(--hi-rgb))' }} stopOpacity=".10" />
              <stop offset=".5" style={{ stopColor: 'var(--ice-2)' }} stopOpacity=".03" />
              <stop offset="1" style={{ stopColor: 'var(--violet)' }} stopOpacity=".07" />
            </radialGradient>
            <linearGradient id={`${uid}-rim`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" style={{ stopColor: 'rgb(var(--hi-rgb))' }} stopOpacity=".55" />
              <stop offset=".4" style={{ stopColor: 'rgb(var(--hi-rgb))' }} stopOpacity=".05" />
              <stop offset="1" style={{ stopColor: 'var(--cyan)' }} stopOpacity=".35" />
            </linearGradient>
            <linearGradient id={`${uid}-pkg`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" style={{ stopColor: 'var(--pkg-1)' }} />
              <stop offset="1" style={{ stopColor: 'var(--pkg-2)' }} />
            </linearGradient>
            <linearGradient id={`${uid}-die`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" style={{ stopColor: 'var(--die-1)' }} />
              <stop offset=".6" style={{ stopColor: 'var(--die-2)' }} />
              <stop offset="1" style={{ stopColor: 'var(--die-3)' }} />
            </linearGradient>
            <linearGradient id={`${uid}-mark`} x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
              <stop offset="0" style={{ stopColor: 'var(--logo-1)' }} />
              <stop offset=".5" style={{ stopColor: 'var(--cyan)' }} />
              <stop offset="1" style={{ stopColor: 'var(--violet)' }} />
            </linearGradient>
            <radialGradient id={`${uid}-heart`}>
              <stop offset="0" style={{ stopColor: 'rgb(var(--reactor-rgb))' }} stopOpacity=".55" />
              <stop offset=".45" style={{ stopColor: 'rgb(var(--reactor-rgb))' }} stopOpacity=".16" />
              <stop offset="1" style={{ stopColor: 'rgb(var(--reactor-rgb))' }} stopOpacity="0" />
            </radialGradient>
            <pattern id={`${uid}-grid`} width="8" height="8" patternUnits="userSpaceOnUse">
              <path d="M8 0H0V8" fill="none" style={{ stroke: 'var(--cyan)' }} strokeOpacity=".07" strokeWidth=".6" />
            </pattern>
          </defs>

          <circle cx={C} cy={C} r="250" fill={`url(#${uid}-halo)`} />

          {/* Schematic rings */}
          <g className="core-rings">
            <circle className="ring ring-ticks" cx={C} cy={C} r="284" />
            <circle className="ring ring-thin" cx={C} cy={C} r={ORBIT} />
            <circle className="ring ring-dash" cx={C} cy={C} r="168" />
            <g className="ring-arcs">
              <path d={`M${C - 258} ${C} A258 258 0 0 1 ${C - 182} ${C - 182}`} />
              <path d={`M${C + 258} ${C} A258 258 0 0 1 ${C + 182} ${C + 182}`} />
            </g>
          </g>

          {/* Board: decorative stubs */}
          <g className="core-stubs">
            {decor.map((s, i) => (
              <g key={i}>
                <path d={s.d} />
                <circle cx={s.via.x} cy={s.via.y} r="2.6" />
              </g>
            ))}
          </g>

          {/* Traces to nodes */}
          <g className="core-traces">
            {routes.map((r, i) => (
              <g key={r.id} className={`trace${active === r.id ? ' is-active' : ''}`} style={{ '--i': i } as CSSProperties}>
                <path className="trace-base" d={r.d} pathLength={100} />
                <path className={`trace-pulse${i % 2 ? ' is-in' : ''}`} d={r.d} pathLength={100} />
                <circle className="trace-pad" cx={r.node.x} cy={r.node.y} r="5" />
              </g>
            ))}
          </g>

          {/* Lens + chip */}
          <g className="core-chip">
            <circle cx={C} cy={C} r="122" fill={`url(#${uid}-lens)`} stroke={`url(#${uid}-rim)`} strokeWidth="1" />
            {/* Arc-blue light from under the package: off until the chip powers on */}
            <circle className="chip-heart" cx={C} cy={C} r="118" fill={`url(#${uid}-heart)`} />
            {pins.map((p, i) => (
              <rect key={i} className="pin" x={p.x} y={p.y} width={p.w} height={p.h} rx="1.5" />
            ))}
            <rect x={C - CHIP} y={C - CHIP} width={CHIP * 2} height={CHIP * 2} rx="14" fill={`url(#${uid}-pkg)`} style={{ stroke: 'rgb(var(--line-rgb) / .28)' }} />
            <rect x={C - 50} y={C - 50} width="100" height="100" rx="8" fill={`url(#${uid}-die)`} />
            <rect x={C - 50} y={C - 50} width="100" height="100" rx="8" fill={`url(#${uid}-grid)`} style={{ stroke: 'rgb(var(--accent-rgb) / .25)' }} />
            <circle cx={C - 58} cy={C - 58} r="3" style={{ fill: 'rgb(var(--line-rgb) / .4)' }} />
            {/* The ST mark (same geometry as components/brand/Monogram.tsx) etched on the die */}
            <g transform={`translate(${C - 38.4} ${C - 38.4}) scale(1.6)`} fill="none" stroke={`url(#${uid}-mark)`} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="chip-mark">
              <path d="M29 4.5V8M34 4.5V8M39 4.5V8M29 17V19.5M39 17V19.5" />
              <rect x="24" y="8" width="20" height="9" rx="2" />
              <path d="M34 17V37.5" />
              <path d="M24 12.5H12L8 16.5V20L12 24H18L22 28V36L18 40H9.6" />
              <circle cx="34" cy="40.5" r="2.6" strokeWidth="1.8" />
              <circle cx="7" cy="40" r="2.6" strokeWidth="1.8" />
            </g>
            <text x={C} y={C + 62} className="chip-label" textAnchor="middle">
              ST · CORE
            </text>
            {/* specular sweep across the lens */}
            <path className="lens-glint" d={`M${C - 96} ${C - 52} A110 110 0 0 1 ${C - 30} ${C - 112}`} />
          </g>
        </svg>

        <div className="core-scan" aria-hidden="true" />

        {/* Interactive nodes (HTML for accessibility) */}
        <ul className="core-nodes" role="list" aria-label="What I work on — select to learn more">
          {routes.map((r) => (
            <li
              key={r.id}
              className="core-node-wrap"
              style={{ left: `${(r.node.x / SIZE) * 100}%`, top: `${(r.node.y / SIZE) * 100}%`, '--a': r.angle } as CSSProperties}
            >
              <button
                type="button"
                className={`core-node${active === r.id ? ' is-active' : ''}`}
                aria-pressed={selected === r.id}
                aria-label={r.label}
                onClick={() => setSelected((s) => (s === r.id ? null : r.id))}
                onPointerEnter={(e) => e.pointerType === 'mouse' && setHovered(r.id)}
                onPointerLeave={() => setHovered(null)}
                onFocus={() => setHovered(r.id)}
                onBlur={() => setHovered(null)}
                data-side={r.node.x < C - 10 ? 'left' : r.node.x > C + 10 ? 'right' : 'center'}
              >
                <Icon name={r.icon} size={16} />
                <span className="core-node-label">{r.label}</span>
              </button>
            </li>
          ))}
        </ul>

        {/* Node detail sits over the chip, inside the circle */}
        <div className="core-readout glass glass--strong" aria-live="polite" data-show={current ? '' : undefined}>
          {current && (
            <>
              <span className="core-readout-title">
                <Icon name={current.icon} size={16} />
                {current.label}
              </span>
              <Badge color={evidenceColor[current.evidence]}>{evidenceLabel[current.evidence]}</Badge>
              <p>{current.detail}</p>
            </>
          )}
        </div>
      </div>

    </div>
  );
}
