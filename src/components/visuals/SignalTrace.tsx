import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '../../hooks/useInView';
import './signal.css';

/*
 * One PCB trace that carries a signal from the hero's chip down the whole page. It runs in the
 * margin beside each section, jogs at 45° between sections, and branches into each section's
 * eyebrow (and any element marked data-signal-tap). Geometry is measured from the real layout, so
 * it re-routes itself at every screen size. A section's stretch lights up when the section reaches
 * the middle of the screen and stays lit; nothing animates while the page is idle.
 */

type Pt = [number, number];
type Mark = { x: number; y: number; at: number };
type Branch = { d: string; len: number; at: number };
type Seg = { d: string; len: number; branches: Branch[]; vias: Mark[] };
type Board = { w: number; h: number; segs: Seg[]; start: Pt; end: Pt };

const DRAW_MS = 1200;
const CHAMFER = 14;

const dist = (a: Pt, b: Pt) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const polyLen = (p: Pt[]) => p.slice(1).reduce((s, q, i) => s + dist(p[i], q), 0);
const toD = (p: Pt[]) => 'M' + p.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L');

/** Length along the polyline to the first point on a vertical run at height y. */
function lengthAtY(p: Pt[], y: number) {
  let acc = 0;
  for (let i = 1; i < p.length; i++) {
    const [a, b] = [p[i - 1], p[i]];
    if (a[0] === b[0] && y >= Math.min(a[1], b[1]) && y <= Math.max(a[1], b[1])) return acc + Math.abs(y - a[1]);
    acc += dist(a, b);
  }
  return acc;
}

/** Layout position relative to `root`, ignoring transforms (scroll-linked motion must not move the trace). */
function box(el: HTMLElement, root: HTMLElement) {
  let x = 0;
  let y = 0;
  let n: HTMLElement | null = el;
  while (n && n !== root) {
    x += n.offsetLeft;
    y += n.offsetTop;
    n = n.offsetParent as HTMLElement | null;
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}

/** Sections that have been rendered at least once; they keep their taps when scrolled out of range again. */
const seen = new WeakSet<Element>();

function measure(main: HTMLElement): Board | null {
  const sections = [...main.querySelectorAll<HTMLElement>(':scope > section')];
  const core = sections[0]?.querySelector<HTMLElement>('.core-stage');
  if (sections.length < 2 || !core) return null;

  // Sections the browser hasn't rendered yet (content-visibility: auto) are routed past using their own
  // box: reading layout inside them would force all of them to lay out. They are re-measured once rendered.
  const rendered = (s: HTMLElement) => {
    const c = s.firstElementChild;
    if (seen.has(s) || !c || !c.checkVisibility || c.checkVisibility({ contentVisibilityAuto: true })) seen.add(s);
    return seen.has(s);
  };
  const container = (s: HTMLElement) => (rendered(s) && s.querySelector<HTMLElement>(':scope > .container')) || s;
  const first = container(sections.slice(1).find(rendered) ?? sections[1]);
  const edge = box(first, main).x + parseFloat(getComputedStyle(first).paddingLeft);
  // Two lanes in the margin left of the content; the trace alternates between them.
  const laneA = edge - Math.min(26, Math.max(6, edge * 0.32));
  const laneB = Math.max(4, edge - Math.min(46, Math.max(8, edge * 0.55)));
  const lane = (i: number) => (i % 2 ? laneA : laneB);

  const top = (s: HTMLElement) => box(container(s), main).y;
  const bottom = (s: HTMLElement) => {
    const b = box(container(s), main);
    return b.y + b.h;
  };
  // Midline of the empty band between two sections' content.
  const band = (i: number) => (bottom(sections[i - 1]) + top(sections[i])) / 2;

  const c = box(core, main);
  // Leave from the bottom of the board's outer tick ring (r 284 of its 600-unit viewBox).
  const start: Pt = [c.x + c.w / 2, c.y + c.h / 2 + (c.w * 284) / 600];
  const segs: Seg[] = [];
  let end = start;

  // Hero: down from the chip, then across the band to the first lane.
  let y1 = band(1);
  let x1 = lane(1);
  let pts: Pt[] = [start, [start[0], y1 - CHAMFER], [start[0] - CHAMFER * Math.sign(start[0] - x1), y1], [x1 + CHAMFER, y1], [x1, y1 + CHAMFER]];
  if (Math.abs(start[0] - x1) < CHAMFER * 3) pts = [start, [x1, y1]];

  for (let i = 0; i < sections.length; i++) {
    const s = sections[i];
    const x = i === 0 ? null : lane(i);
    const runTop = pts[pts.length - 1][1];
    let runEnd = runTop;
    if (x !== null) {
      const last = i === sections.length - 1;
      const sink = last && rendered(s) ? s.querySelector<HTMLElement>('[data-signal-end]') : null;
      if (sink) {
        // The signal ends by plugging into the edge of the marked element.
        const b = box(sink, main);
        runEnd = b.y + b.h / 2;
        const c = Math.min(CHAMFER, (b.x - 2 - x) / 2);
        pts.push([x, runEnd - c], [x + c, runEnd], [b.x - 2, runEnd]);
      } else {
        // Run down this section's lane to the next band (or the end of the content).
        const jog = last ? 0 : Math.abs(lane(i + 1) - x);
        runEnd = (last ? bottom(s) - 8 : band(i + 1)) - jog / 2;
        pts.push([x, runEnd]);
      }
    }
    const len = polyLen(pts);
    const branches: Branch[] = [];
    const vias: Mark[] = [];

    if (x !== null && rendered(s)) {
      const taps = [s.querySelector<HTMLElement>('.section-head .eyebrow'), ...s.querySelectorAll<HTMLElement>('[data-signal-tap]')];
      for (const t of taps) {
        if (!t || !t.offsetParent || t.closest('[data-signal-skip]')) continue;
        const b = box(t, main);
        const ty = b.y + b.h / 2;
        const tx = b.x - 3;
        const at = lengthAtY(pts, ty);
        // On phones the margin is too narrow for a branch; the via alone marks the tap.
        if (tx - x >= 4) branches.push({ d: toD([[x, ty], [tx, ty]]), len: tx - x, at });
        vias.push({ x, y: ty, at });
      }
      // A short stub toward the screen edge, two thirds down, where the margin is wide enough.
      const stubLen = Math.min(14, x - 8);
      if (stubLen >= 8) {
        const run = runEnd - runTop;
        const sy = runTop + run * 0.62;
        if (run > 160 && branches.every((b) => Math.abs(lengthAtY(pts, sy) - b.at) > 60)) {
          const p: Pt[] = [[x, sy], [x - stubLen, sy + stubLen], [x - stubLen, sy + stubLen + 12]];
          const at = lengthAtY(pts, sy);
          branches.push({ d: toD(p), len: polyLen(p), at });
          vias.push({ x: x - stubLen, y: sy + stubLen + 12, at: at + polyLen(p) });
        }
      }
    }

    segs.push({ d: toD(pts), len, branches, vias });
    end = pts[pts.length - 1];
    if (x !== null && i < sections.length - 1) {
      // The 45° jog to the next lane starts the next section's stretch.
      const p = pts[pts.length - 1];
      const nx = lane(i + 1);
      pts = [p, [nx, p[1] + Math.abs(nx - x)]];
    } else if (x === null) {
      pts = [pts[pts.length - 1]];
    }
  }

  return { w: main.clientWidth, h: main.offsetHeight, segs, start, end };
}

export function SignalTrace() {
  const ref = useRef<HTMLDivElement>(null);
  const [board, setBoard] = useState<Board | null>(null);
  const [current, setCurrent] = useState(-1);
  const [lit, setLit] = useState(-1);
  const reduce = usePrefersReducedMotion();
  const pulses = useRef<(SVGPathElement | null)[]>([]);
  const lens = useRef<number[]>([]);
  lens.current = board?.segs.map((s) => s.len) ?? [];
  const ready = current >= 0 && current <= lit;

  // Measure once the page is idle and whenever the page or any section changes size (fonts, theme,
  // lazily rendered sections). The observer's first callback triggers the initial measure.
  useEffect(() => {
    const main = ref.current?.parentElement;
    if (!main) return;
    // Measuring reads layout inside every section, which forces the lazily rendered (content-visibility)
    // ones to lay out, so wait for resizing to settle and for the main thread to be free.
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1));
    const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout;
    let timer = 0;
    let task = 0;
    const update = () => {
      window.clearTimeout(timer);
      cancelIdle(task);
      timer = window.setTimeout(() => {
        task = idle(() => setBoard(measure(main)), { timeout: 1000 });
      }, 120);
    };
    const ro = new ResizeObserver(update);
    ro.observe(main);
    main.querySelectorAll(':scope > section').forEach((s) => ro.observe(s));
    // A section rendering for the first time brings its taps into the layout, even if its size didn't change.
    const onState = (e: Event) => {
      if (!(e as Event & { skipped?: boolean }).skipped && !seen.has(e.target as Element)) update();
    };
    main.addEventListener('contentvisibilityautostatechange', onState, true);
    return () => {
      window.clearTimeout(timer);
      cancelIdle(task);
      ro.disconnect();
      main.removeEventListener('contentvisibilityautostatechange', onState, true);
    };
  }, []);

  // The section crossing the middle of the screen is the current one.
  useEffect(() => {
    const main = ref.current?.parentElement;
    if (!main) return;
    const sections = [...main.querySelectorAll(':scope > section')];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setCurrent(sections.indexOf(e.target));
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  // Light everything up to the current section; the hero waits for its own entrance to finish.
  useEffect(() => {
    if (current < 0) return;
    const t = window.setTimeout(() => setLit((l) => Math.max(l, current)), lit < 0 ? 700 : 0);
    return () => window.clearTimeout(t);
  }, [current, lit]);

  // One pulse runs along the current section's stretch each time it is reached.
  useEffect(() => {
    const el = pulses.current[current];
    if (reduce || !el || !ready) return;
    const len = lens.current[current] ?? 0;
    const P = 48;
    const a = el.animate(
      [
        { strokeDashoffset: P, opacity: 0 },
        { opacity: 1, offset: 0.12 },
        { opacity: 1, offset: 0.85 },
        { strokeDashoffset: -len, opacity: 0 },
      ],
      { duration: Math.min(2600, Math.max(1100, len * 1.6)), delay: 250, easing: 'cubic-bezier(0.45, 0, 0.25, 1)' },
    );
    return () => a.cancel();
  }, [current, ready, reduce]);

  const on = (i: number) => reduce || i <= lit;

  return (
    <div ref={ref} className="signal" aria-hidden="true">
      {board && (
        <svg width={board.w} height={board.h} viewBox={`0 0 ${board.w} ${board.h}`} focusable="false">
          <defs>
            <linearGradient id="signal-ink" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={board.h}>
              <stop offset="0" className="sig-stop-1" />
              <stop offset="0.5" className="sig-stop-2" />
              <stop offset="1" className="sig-stop-3" />
            </linearGradient>
          </defs>
          {board.segs.map((s, i) => (
            <g key={i} className="sig-seg" data-on={on(i) || undefined}>
              <path className="sig-base" d={[s.d, ...s.branches.map((b) => b.d)].join(' ')} />
              <path className="sig-glow" d={s.d} style={{ ['--len' as string]: `${s.len}px` }} />
              <path className="sig-lit" d={s.d} style={{ ['--len' as string]: `${s.len}px` }} />
              {s.branches.map((b, j) => (
                <path
                  key={j}
                  className="sig-lit sig-branch"
                  d={b.d}
                  style={{ ['--len' as string]: `${b.len}px`, ['--delay' as string]: `${(b.at / (s.len || 1)) * DRAW_MS}ms` }}
                />
              ))}
              {s.vias.map((v, j) => (
                <circle key={j} className="sig-via" cx={v.x} cy={v.y} r={2.6} style={{ ['--delay' as string]: `${(v.at / (s.len || 1)) * DRAW_MS}ms` }} />
              ))}
              <path ref={(el) => void (pulses.current[i] = el)} className="sig-pulse" d={s.d} style={{ strokeDasharray: `48px ${s.len + 96}px` }} />
            </g>
          ))}
          <circle className="sig-pad" cx={board.start[0]} cy={board.start[1]} r={4} data-on={on(0) || undefined} />
          <circle className="sig-pad" cx={board.end[0]} cy={board.end[1]} r={4} data-on={on(board.segs.length - 1) || undefined} />
        </svg>
      )}
    </div>
  );
}
