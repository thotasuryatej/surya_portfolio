import { useEffect, useRef, useState, type KeyboardEvent, type RefObject } from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { mindset, mindsetIntro, projectBySlug } from '../content';
import { SectionHead } from '../components/ui/Reveal';
import { Glass } from '../components/ui/Glass';
import { useProjectRoute } from '../hooks/useProjectRoute';
import { useMedia } from '../hooks/useMedia';
import { useScrollSteps } from '../hooks/useScrollSteps';
import { useScrolledPast } from '../hooks/useScrolledPast';
import './mindset.css';

/*
 * "Builder's Core": my own arc reactor, drawn for this site — a bolted metal casing, a ring of copper coils
 * and a glass core. Six slots in the casing are the six build habits; each lit habit lets light through
 * its slot and between its two coils, and the core burns brighter as more habits are lit.
 * The section pins and scrolling charges the core one habit at a time. On narrow screens the core also turns
 * like a dial, bringing the current habit's segment to the top (the labels sit below it there, not around it).
 */

const N = mindset.length;
/** Scroll each pinned step takes, in vh: a full screen on phones, where a swipe travels far, so a habit
    stays up long enough to read */
const STEP = 48;
const STEP_TOUCH = 100;

const pt = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return `${(r * Math.cos(a)).toFixed(2)} ${(r * Math.sin(a)).toFixed(2)}`;
};
/** A ring sector from angle a0 to a1 (degrees), between radii r0 and r1. */
const sector = (r0: number, r1: number, a0: number, a1: number) =>
  `M${pt(r1, a0)}A${r1} ${r1} 0 0 1 ${pt(r1, a1)}L${pt(r0, a1)}A${r0} ${r0} 0 0 0 ${pt(r0, a0)}Z`;

/** Habit k is centred on -90 + 60k degrees (k = 0 at the top), matching the labels around the core. */
const SEGMENTS = mindset.map((_, k) => sector(66, 84, -90 + 60 * k - 27.5, -90 + 60 * k + 27.5));
/** Two coils per habit, either side of its centre. */
const COILS = Array.from({ length: N * 2 }, (_, j) => sector(45, 61, -105 + 30 * j - 10.5, -105 + 30 * j + 10.5));
/** Copper windings: radial turns across each coil */
const WINDINGS = COILS.map((_, j) =>
  Array.from({ length: 8 }, (_, w) => {
    const a = -105 + 30 * j - 8.4 + w * 2.4;
    return `M${pt(46.5, a)}L${pt(59.5, a)}`;
  }).join(''),
);
/** The light behind each habit: the gaps between its coils and the strip in its slot */
const GLOW = mindset.map((_, k) => sector(43, 63, -90 + 60 * k - 30, -90 + 60 * k + 30));
const STRIPS = mindset.map((_, k) => sector(73, 77, -90 + 60 * k - 24, -90 + 60 * k + 24));
const BOLTS = Array.from({ length: 12 }, (_, i) => pt(91, -75 + 30 * i).split(' '));

export function Mindset() {
  const still = useReducedMotion();
  // Pin wherever the core, its labels and the panel fit on one screen. Narrow, only on touch screens (stacked,
  // turned by swipes that snap a step at a time); a narrow desktop window keeps the click version.
  const fits = useMedia(
    '(min-width: 901px) and (min-height: 640px), (max-width: 900px) and (min-height: 600px) and (pointer: coarse)',
  );
  // Once scrolled past, it stays the click version: coming back up doesn't replay the whole pin
  const section = useRef<HTMLElement>(null);
  const past = useScrolledPast(section);
  const pinned = fits && !still && !past;
  const touch = useMedia('(max-width: 900px) and (pointer: coarse)');
  const height = N * (touch ? STEP_TOUCH : STEP);
  return (
    <section
      id="mindset"
      ref={section}
      className={`section${pinned ? ' section--pinned' : ''}`}
      // Pinned, it is several screens tall; say so before it first renders (content-visibility) so jumps land right
      style={pinned ? { containIntrinsicSize: `auto calc(100vh + ${height}vh)` } : undefined}
      aria-labelledby="mindset-title"
    >
      {pinned ? <Pinned height={height} touch={touch} /> : <Clicked from={past ? N - 1 : 0} />}
    </section>
  );
}

const Head = () => <SectionHead id="mindset-title" eyebrow="Mindset" title="How I build" lead={mindsetIntro} />;

/** Short screens, reduced motion, and after the pinned version has played: pick a habit; the core charges
    once when it scrolls into view. `from`: the habit shown first (the last one once the pin has played). */
function Clicked({ from }: { from: number }) {
  const reduce = useReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const charged = useInView(stage, { once: true, amount: 0.5 });
  const [active, setActive] = useState(from);
  return (
    <div className="container">
      <Head />
      <Core stage={stage} charged={charged || !!reduce} active={active} select={setActive} />
    </div>
  );
}

/** `height`: the extra scroll the pinned section takes, in vh. `touch`: a phone, where swipes snap. */
function Pinned({ height, touch }: { height: number; touch: boolean }) {
  const { outer, step, goTo } = useScrollSteps(N);
  // While the core is pinned on a phone, snapping is mandatory, so even a hard flick stops at the next habit.
  // It is off at the pin's two ends (snap points too), so the page scrolls freely on either side.
  useEffect(() => {
    const el = outer.current;
    if (!touch || !el) return;
    const root = document.documentElement;
    const check = () => {
      const top = el.getBoundingClientRect().top;
      const end = el.offsetHeight - innerHeight;
      root.classList.toggle('bc-snapping', top < -2 && -top < end - 2);
    };
    check();
    addEventListener('scroll', check, { passive: true });
    return () => {
      removeEventListener('scroll', check);
      root.classList.remove('bc-snapping');
    };
  }, [outer, touch]);
  return (
    <>
      {/* On phones the head and its full intro scroll in above the pin; pinned, there is only room for the core */}
      {touch && (
        <div className="container bc-intro">
          <Head />
        </div>
      )}
    <div ref={outer} className="bc-outer" style={{ height: `calc(100vh + ${height}vh)` }}>
      {/* One snap point in the middle of each step's stretch of scroll, where goTo lands too, and one at each
          end of the pin. On phones a swipe stops at each of them, so a flick moves one habit (mindset.css). */}
      {mindset.map((_, k) => (
        <i key={k} className="bc-snap" style={{ ['--at' as string]: `${(height * (k + 0.5)) / N}vh` }} aria-hidden="true" />
      ))}
      <i className="bc-snap bc-snap--end" style={{ ['--at' as string]: '0vh' }} aria-hidden="true" />
      <i className="bc-snap bc-snap--end" style={{ ['--at' as string]: `${height}vh` }} aria-hidden="true" />
      {/* Pinned content stays put while the page scrolls, so the page-long signal trace doesn't tap into it */}
      <div className="pin-stage bc-pin" data-signal-skip="">
        <div className="container">
          {!touch && <Head />}
          <Core charged pinned active={step} select={goTo} />
        </div>
      </div>
    </div>
    </>
  );
}

function Core({
  stage,
  charged,
  pinned,
  active,
  select,
}: {
  stage?: RefObject<HTMLDivElement | null>;
  charged: boolean;
  pinned?: boolean;
  active: number;
  select: (k: number) => void;
}) {
  const { open } = useProjectRoute();
  const btns = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: KeyboardEvent) => {
    const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    // Step from the focused label (which scrolling may have left behind the selected one)
    const at = btns.current.indexOf(e.target as HTMLButtonElement);
    const from = at < 0 ? active : at;
    const to = e.key === 'Home' ? 0 : e.key === 'End' ? N - 1 : dir ? (from + dir + N) % N : -1;
    if (to < 0) return;
    e.preventDefault();
    select(to);
    btns.current[to]?.focus({ preventScroll: true });
  };

  return (
    <div className={pinned ? 'bc bc--pinned' : 'bc'}>
      <div
        className="bc-stage"
        ref={stage}
        data-charged={charged ? '' : undefined}
        style={{ ['--charge' as string]: charged ? (active + 1) / N : 0, ['--turn' as string]: active }}
      >
        <svg className="bc-core" viewBox="-100 -100 200 200" aria-hidden="true">
          <defs>
            <linearGradient id="bc-metal" x1="-90" y1="-90" x2="90" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="var(--metal-hi)" />
              <stop offset="0.3" stopColor="var(--metal-lo)" />
              <stop offset="0.55" stopColor="var(--metal-mid)" />
              <stop offset="0.8" stopColor="var(--metal-lo)" />
              <stop offset="1" stopColor="var(--metal-mid)" />
            </linearGradient>
            <linearGradient id="bc-copper" x1="-60" y1="-60" x2="60" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#d8945c" />
              <stop offset="0.45" stopColor="#8a4a22" />
              <stop offset="0.7" stopColor="#c27a43" />
              <stop offset="1" stopColor="#6e3817" />
            </linearGradient>
            <radialGradient id="bc-lens">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="0.18" stopColor="#f2fbff" />
              <stop offset="0.45" stopColor="rgb(var(--reactor-rgb))" />
              <stop offset="0.8" stopColor="rgb(var(--reactor-rgb) / 0.35)" />
              <stop offset="1" stopColor="rgb(var(--reactor-rgb) / 0)" />
            </radialGradient>
            <radialGradient id="bc-hot">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.7" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="bc-bloom">
              <stop offset="0.3" stopColor="rgb(var(--reactor-rgb) / 0.5)" />
              <stop offset="1" stopColor="rgb(var(--reactor-rgb) / 0)" />
            </radialGradient>
          </defs>

          {/* Casing: a bolted metal ring */}
          <circle className="bc-casing" r="91" />
          <circle className="bc-casing-edge" r="96" />
          <circle className="bc-casing-edge" r="85.5" />
          {BOLTS.map(([x, y]) => (
            <g key={x + y} className="bc-bolt" transform={`translate(${x} ${y})`}>
              <circle r="2.6" />
              <path d="M-1.5 0H1.5" />
            </g>
          ))}

          <g className="bc-rotor">
            {GLOW.map((d, k) => (
              <path key={k} d={d} className="bc-glow" data-lit={k <= active ? '' : undefined} />
            ))}
            {SEGMENTS.map((d, k) => (
              <path
                key={k}
                d={d}
                className="bc-seg"
                data-lit={k <= active ? '' : undefined}
                data-on={k === active ? '' : undefined}
                onClick={() => select(k)}
              />
            ))}
            {STRIPS.map((d, k) => (
              <path
                key={k}
                d={d}
                className="bc-strip"
                data-lit={k <= active ? '' : undefined}
                data-on={k === active ? '' : undefined}
              />
            ))}
            {COILS.map((d, j) => (
              <g key={j} className="bc-coil" data-lit={Math.floor(j / 2) <= active ? '' : undefined}>
                <path d={d} />
                <path className="bc-wind" d={WINDINGS[j]} />
              </g>
            ))}
          </g>

          {/* Core: a glass lens over the light, in a machined collar */}
          <circle className="bc-collar" r="39" />
          <circle className="bc-die" r="33" />
          <circle className="bc-light" r="33" />
          {/* The emitter ring and the white-hot heart, both brighter with every habit lit */}
          <circle className="bc-emitter" r="23" />
          <circle className="bc-hot" r="13" />
          {/* A flash of light through the lens each time the habit changes (re-keyed, so it replays) */}
          <circle key={active} className="bc-flash" r="30" />
          <circle className="bc-bloom" r="78" />
          <ellipse className="bc-glint" cx="-11" cy="-14" rx="13" ry="6" transform="rotate(-35 -11 -14)" />
        </svg>

        <div className="bc-labels" role="group" aria-label="Build habits" onKeyDown={onKey}>
          {mindset.map((s, k) => (
            <button
              key={s.short}
              ref={(el) => {
                btns.current[k] = el;
              }}
              type="button"
              className="bc-label"
              aria-pressed={k === active}
              tabIndex={k === active ? 0 : -1}
              style={{ ['--k' as string]: k }}
              onClick={() => select(k)}
            >
              <span className="bc-label-num mono" aria-hidden="true">
                {String(k + 1).padStart(2, '0')}
              </span>
              {s.short}
            </button>
          ))}
        </div>
        {pinned && (
          <p className="bc-hint mono" aria-hidden="true">
            Scroll to turn the core
          </p>
        )}
      </div>

      <Glass variant="strong" className="bc-panel" aria-live="polite">
        <div className="bc-body">
          {/* Pinned, every step is laid out unseen in the same cell, so the panel is as tall as the longest
              one and the core above it keeps its size from step to step */}
          {pinned &&
            mindset.map((_, k) => (
              <div key={k} className="bc-sizer" aria-hidden="true">
                <StepBody k={k} />
              </div>
            ))}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <StepBody k={active} open={open} />
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="bc-meter" aria-hidden="true">
          {mindset.map((_, k) => (
            <i key={k} data-lit={k <= active ? '' : undefined} />
          ))}
        </div>
      </Glass>
    </div>
  );
}

function StepBody({ k, open }: { k: number; open?: (slug: string) => void }) {
  const step = mindset[k];
  const project = step.example ? projectBySlug(step.example.project) : undefined;
  return (
    <>
      <p className="bc-step mono">
        Step {k + 1} of {N}
      </p>
      <h3 className="bc-title">{step.title}</h3>
      <p className="bc-text">{step.text}</p>
      {project && (
        <p className="bc-seen">
          <span className="mono">Seen in</span>
          <button type="button" className="text-link" tabIndex={open ? undefined : -1} onClick={() => open?.(project.slug)}>
            {project.title}
            <ArrowUpRight size={14} aria-hidden="true" />
          </button>
        </p>
      )}
    </>
  );
}
