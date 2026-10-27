import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { journey, journeyPhases, milestoneDate, projectBySlug } from '../content';
import { SectionHead } from '../components/ui/Reveal';
import { Icon } from '../components/ui/Icon';
import { useProjectRoute } from '../hooks/useProjectRoute';
import { asset } from '../lib/asset';
import './journey.css';

const WIDE = '(min-width: 900px)';

/** The phase that starts at stop i, with how many stops it spans; undefined mid-phase. */
const phaseAt = (i: number) => {
  const id = journey[i].phase;
  if (i > 0 && journey[i - 1].phase === id) return undefined;
  const phase = journeyPhases.find((p) => p.id === id)!;
  return { ...phase, count: journey.filter((m) => m.phase === id).length };
};

/**
 * Journey: a PCB trace from 2021 to now. On wide screens the section pins and scrolling moves the
 * board sideways; each milestone "powers on" as the current reaches it. On narrow screens (and with
 * reduced motion) it is a plain vertical timeline whose trace fills as you scroll.
 */
export function Journey() {
  const still = useReducedMotion();
  const [wide, setWide] = useState(() => typeof matchMedia === 'function' && matchMedia(WIDE).matches);
  useEffect(() => {
    const mq = matchMedia(WIDE);
    const on = () => setWide(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  const pinned = wide && !still;

  return (
    <section id="journey" className={`section jr${pinned ? ' section--pinned jr--pinned' : ''}`} aria-labelledby="journey-title">
      {pinned ? <Pinned /> : <Stacked />}
    </section>
  );
}

function Head() {
  return (
    <SectionHead
      id="journey-title"
      eyebrow="Journey"
      title="From a first circuit to shipping firmware"
      lead="B.Tech from 2021 to 2025, an internship, then full-time firmware. Stops with an arrow open a case study."
    />
  );
}

function Pinned() {
  const outer = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLOListElement>(null);
  const [dist, setDist] = useState(0);
  const [lit, setLit] = useState(0);

  useLayoutEffect(() => {
    const r = rail.current;
    const t = track.current;
    if (!r || !t) return;
    // Slide until the last stop lines up with the right edge of the content column.
    const measure = () => {
      const cs = getComputedStyle(r);
      setDist(Math.max(0, t.scrollWidth - (r.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight))));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(r);
    ro.observe(t);
    return () => ro.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({ target: outer, offset: ['start start', 'end end'] });
  const smooth = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.35 });
  const x = useTransform(smooth, (p) => -p * dist);
  const fill = useTransform(smooth, [0, 1], [0.03, 1]);
  useMotionValueEvent(smooth, 'change', (p) => setLit(Math.round(p * (journey.length - 1))));

  return (
    <div ref={outer} className="jr-outer" style={{ height: `calc(100vh + ${dist}px)` }}>
      {/* Pinned content stays put while the page scrolls, so the page-long signal trace doesn't tap into it */}
      <div className="jr-pin" data-signal-skip="">
        <div className="container">
          <Head />
        </div>
        <div ref={rail} className="jr-rail">
          <motion.ol ref={track} className="jr-track" role="list" style={{ x }}>
            <span className="jr-line" aria-hidden="true">
              <motion.span className="jr-current" style={{ scaleX: fill }} />
            </span>
            {journey.map((m, i) => {
              const phase = phaseAt(i);
              return (
                <li key={m.title} className="jr-stop" data-on={i <= lit || undefined}>
                  {phase && (
                    <span className="jr-band" style={{ ['--n' as string]: phase.count }}>
                      <strong>{phase.label}</strong>
                      <span className="mono">{phase.range}</span>
                    </span>
                  )}
                  <Stop m={m} />
                </li>
              );
            })}
          </motion.ol>
        </div>
      </div>
    </div>
  );
}

function Stacked() {
  const list = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: list, offset: ['start 0.8', 'end 0.6'] });
  return (
    <div className="container">
      <Head />
      <ol ref={list} className="jr-list" role="list">
        <span className="jr-vline" aria-hidden="true">
          <motion.span className="jr-current" style={{ scaleY: scrollYProgress }} />
        </span>
        {journey.map((m, i) => {
          const phase = phaseAt(i);
          return [
            phase && (
              <li key={phase.id} className="jr-phase-head">
                <strong>{phase.label}</strong>
                <span className="mono">{phase.range}</span>
              </li>
            ),
            <motion.li
              key={m.title}
              className="jr-stop"
              data-on
              initial={{ opacity: 0, x: 18 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '0px 0px -10% 0px' }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <Stop m={m} />
            </motion.li>,
          ];
        })}
      </ol>
    </div>
  );
}

function Stop({ m }: { m: (typeof journey)[number] }) {
  const { open } = useProjectRoute();
  const p = m.project ? projectBySlug(m.project) : undefined;
  const body = (
    <>
      <span className="jr-pad" aria-hidden="true" />
      <span className="jr-when mono">{milestoneDate(m)}</span>
      <span className="jr-card glass glass--thin">
        <span className="jr-top">
          {m.logo ? (
            <img className="jr-logo" src={asset(m.logo.src)} alt={m.logo.alt} width={40} height={40} loading="lazy" />
          ) : (
            <span className="jr-icon" aria-hidden="true">
              <Icon name={m.icon} size={18} />
            </span>
          )}
          {p && <ArrowUpRight className="jr-go" size={16} aria-hidden="true" />}
        </span>
        <strong className="jr-title">{m.title}</strong>
        <span className="jr-text">{m.text}</span>
      </span>
    </>
  );
  return p ? (
    <button type="button" className="jr-btn" data-kind={m.kind} onClick={() => open(p.slug)} aria-label={`${milestoneDate(m)}: ${m.title}. Open case study`}>
      {body}
    </button>
  ) : (
    <div className="jr-btn" data-kind={m.kind}>
      {body}
    </div>
  );
}
