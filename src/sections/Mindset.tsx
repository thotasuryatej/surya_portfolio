import { useRef, useState, type KeyboardEvent, type RefObject } from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { mindset, mindsetIntro, projectBySlug } from '../content';
import { SectionHead } from '../components/ui/Reveal';
import { Glass } from '../components/ui/Glass';
import { Icon } from '../components/ui/Icon';
import { useProjectRoute } from '../hooks/useProjectRoute';
import { useMedia } from '../hooks/useMedia';
import { useScrollSteps } from '../hooks/useScrollSteps';
import './mindset.css';

/*
 * "Builder's Core": an original reactor-style core. Six arc segments are the six build habits; the
 * coil ring inside lights two coils per habit, and the core glows brighter as more habits are lit.
 * The section pins and scrolling charges the core one habit at a time. On narrow screens the core also turns
 * like a dial, bringing the current habit's segment to the top (the labels sit below it there, not around it).
 */

const N = mindset.length;
/** Extra scroll the pinned section takes, in vh */
const HEIGHT = N * 48;

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
const COILS = Array.from({ length: N * 2 }, (_, j) => sector(46, 59, -105 + 30 * j - 10, -105 + 30 * j + 10));
const TICKS = Array.from({ length: 72 }, (_, i) => i * 5);

export function Mindset() {
  const still = useReducedMotion();
  // Pin wherever the core, its labels and the panel fit on one screen (stacked, on narrow screens)
  const fits = useMedia('(min-width: 901px) and (min-height: 640px), (max-width: 900px) and (min-height: 600px)');
  const pinned = fits && !still;
  return (
    <section
      id="mindset"
      className={`section${pinned ? ' section--pinned' : ''}`}
      // Pinned, it is several screens tall; say so before it first renders (content-visibility) so jumps land right
      style={pinned ? { containIntrinsicSize: `auto calc(100vh + ${HEIGHT}vh)` } : undefined}
      aria-labelledby="mindset-title"
    >
      {pinned ? <Pinned /> : <Clicked />}
    </section>
  );
}

const Head = () => <SectionHead id="mindset-title" eyebrow="Mindset" title="How I build" lead={mindsetIntro} />;

/** Short screens and reduced motion: pick a habit; the core charges once when it scrolls into view. */
function Clicked() {
  const reduce = useReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const charged = useInView(stage, { once: true, amount: 0.5 });
  const [active, setActive] = useState(0);
  return (
    <div className="container">
      <Head />
      <Core stage={stage} charged={charged || !!reduce} active={active} select={setActive} />
    </div>
  );
}

function Pinned() {
  const { outer, step, goTo } = useScrollSteps(N);
  return (
    <div ref={outer} style={{ height: `calc(100vh + ${HEIGHT}vh)` }}>
      {/* Pinned content stays put while the page scrolls, so the page-long signal trace doesn't tap into it */}
      <div className="pin-stage bc-pin" data-signal-skip="">
        <div className="container">
          <Head />
          <Core charged pinned active={step} select={goTo} />
        </div>
      </div>
    </div>
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
  const step = mindset[active];

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
            <linearGradient id="bc-grad" x1="-80" y1="-80" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="var(--cyan)" />
              <stop offset="1" stopColor="var(--violet)" />
            </linearGradient>
            <radialGradient id="bc-halo">
              <stop offset="0.55" stopColor="var(--cyan)" stopOpacity="0.55" />
              <stop offset="0.8" stopColor="var(--cyan)" stopOpacity="0.18" />
              <stop offset="1" stopColor="var(--cyan)" stopOpacity="0" />
            </radialGradient>
          </defs>

          <g className="bc-ticks">
            {TICKS.map((a) => (
              <line key={a} x1="0" y1={a % 30 ? -91 : -88} x2="0" y2="-95" transform={`rotate(${a})`} />
            ))}
          </g>
          <circle className="bc-ring" r="62.5" />
          <g className="bc-rotor">
            {SEGMENTS.map((d, k) => (
              <path
                key={k}
                d={d}
                className="bc-seg"
                data-lit={k <= active ? '' : undefined}
                data-on={k === active ? '' : undefined}
                style={{ ['--k' as string]: k }}
                onClick={() => select(k)}
              />
            ))}
            {COILS.map((d, j) => (
              <path
                key={j}
                d={d}
                className="bc-coil"
                data-lit={Math.floor(j / 2) <= active ? '' : undefined}
                style={{ ['--k' as string]: Math.floor(j / 2) }}
              />
            ))}
          </g>
          <circle className="bc-halo" r="44" />
          <circle className="bc-die" r="31" />
          <circle className="bc-die-ring" r="34.5" />
        </svg>

        <div className="bc-center" aria-hidden="true">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={active}
              className="bc-center-in"
              initial={{ opacity: 0, scale: 0.7, filter: 'blur(4px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.2, filter: 'blur(4px)' }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <Icon name={step.icon} size={26} />
              <span className="bc-center-num mono">{String(active + 1).padStart(2, '0')}</span>
            </motion.span>
          </AnimatePresence>
        </div>

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
