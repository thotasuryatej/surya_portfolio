import { useRef, useState, type KeyboardEvent } from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { mindset, mindsetIntro, projectBySlug } from '../content';
import { SectionHead } from '../components/ui/Reveal';
import { Glass } from '../components/ui/Glass';
import { Icon } from '../components/ui/Icon';
import { useProjectRoute } from '../hooks/useProjectRoute';
import './mindset.css';

/*
 * "Builder's Core": an original hexagonal core whose six segments are the six build habits.
 * Segments up to the selected habit are lit, so the core "charges" as you move through it.
 */

const R_OUT = 88;
const R_IN = 64;
const GAP = 3.2;

const pt = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return [r * Math.cos(a), r * Math.sin(a)] as const;
};
const lerp = (a: readonly [number, number], b: readonly [number, number], d: number) => {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  return [a[0] + ((b[0] - a[0]) * d) / len, a[1] + ((b[1] - a[1]) * d) / len] as const;
};

/** Segment k is the hexagon edge centred on -90 + 60k degrees (k = 0 is the top edge). */
function segmentPath(k: number) {
  const a0 = -120 + 60 * k;
  const a1 = a0 + 60;
  const o0 = pt(R_OUT, a0), o1 = pt(R_OUT, a1), i0 = pt(R_IN, a0), i1 = pt(R_IN, a1);
  const p = [lerp(o0, o1, GAP), lerp(o1, o0, GAP), lerp(i1, i0, GAP), lerp(i0, i1, GAP)];
  return `M${p.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join('L')}Z`;
}
const SEGMENTS = mindset.map((_, k) => segmentPath(k));

function hexPoints(r: number) {
  return Array.from({ length: 6 }, (_, k) => pt(r, -120 + 60 * k).map((v) => v.toFixed(2)).join(',')).join(' ');
}

export function Mindset() {
  const { open } = useProjectRoute();
  const reduce = useReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const charged = useInView(stage, { once: true, amount: 0.5 });
  const [active, setActive] = useState(0);
  const btns = useRef<(HTMLButtonElement | null)[]>([]);

  const step = mindset[active];
  const project = step.example ? projectBySlug(step.example.project) : undefined;

  const onKey = (e: KeyboardEvent) => {
    const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    const to = e.key === 'Home' ? 0 : e.key === 'End' ? mindset.length - 1 : dir ? (active + dir + mindset.length) % mindset.length : -1;
    if (to < 0) return;
    e.preventDefault();
    setActive(to);
    btns.current[to]?.focus();
  };

  return (
    <section id="mindset" className="section" aria-labelledby="mindset-title">
      <div className="container">
        <SectionHead id="mindset-title" eyebrow="Mindset" title="How I build" lead={mindsetIntro} />

        <div className="bc">
          <div className="bc-stage" ref={stage} data-charged={charged || reduce ? '' : undefined}>
            <svg className="bc-core" viewBox="-100 -100 200 200" aria-hidden="true">
              <defs>
                <linearGradient id="bc-grad" x1="-80" y1="-80" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="var(--cyan)" />
                  <stop offset="1" stopColor="var(--violet)" />
                </linearGradient>
              </defs>
              <circle className="bc-orbit" r="96" />
              {SEGMENTS.map((d, k) => (
                <path
                  key={k}
                  d={d}
                  className="bc-seg"
                  data-lit={k <= active ? '' : undefined}
                  data-on={k === active ? '' : undefined}
                  style={{ ['--k' as string]: k }}
                  onClick={() => setActive(k)}
                />
              ))}
              <polygon className="bc-die-ring" points={hexPoints(54)} />
              <polygon className="bc-die" points={hexPoints(46)} />
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
                  onClick={() => setActive(k)}
                >
                  <span className="bc-label-num mono" aria-hidden="true">
                    {String(k + 1).padStart(2, '0')}
                  </span>
                  {s.short}
                </button>
              ))}
            </div>
          </div>

          <Glass variant="strong" className="bc-panel" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="bc-step mono">
                  Step {active + 1} of {mindset.length}
                </p>
                <h3 className="bc-title">{step.title}</h3>
                <p className="bc-text">{step.text}</p>
                {project && (
                  <p className="bc-seen">
                    <span className="mono">Seen in</span>
                    <button type="button" className="text-link" onClick={() => open(project.slug)}>
                      {project.title}
                      <ArrowUpRight size={14} aria-hidden="true" />
                    </button>
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
            <div className="bc-meter" aria-hidden="true">
              {mindset.map((_, k) => (
                <i key={k} data-lit={k <= active ? '' : undefined} />
              ))}
            </div>
          </Glass>
        </div>
      </div>
    </section>
  );
}
