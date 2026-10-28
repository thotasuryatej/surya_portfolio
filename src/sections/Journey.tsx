import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { journey, journeyPhases, milestoneDate, projectBySlug } from '../content';
import { SectionHead } from '../components/ui/Reveal';
import { Icon } from '../components/ui/Icon';
import { useProjectRoute } from '../hooks/useProjectRoute';
import { asset } from '../lib/asset';
import { useScrolledPast } from '../hooks/useScrolledPast';
import './journey.css';

/** Where the section pins and scrolls sideways: wide screens, and phones tall enough for the board */
const WIDE = '(min-width: 900px), (pointer: coarse) and (min-height: 600px)';
/** On phones a swipe travels far; the board takes more scroll per stop, so it moves at a readable pace */
const TOUCH = '(max-width: 899px) and (pointer: coarse)';

/** The phase that starts at stop i, with how many stops it spans; undefined mid-phase. */
const phaseAt = (i: number) => {
  const id = journey[i].phase;
  if (i > 0 && journey[i - 1].phase === id) return undefined;
  const phase = journeyPhases.find((p) => p.id === id)!;
  return { ...phase, count: journey.filter((m) => m.phase === id).length };
};

/**
 * Journey: a PCB trace from 2021 to now. On wide screens and phones the section pins and scrolling moves
 * the board sideways; each milestone "powers on" as the current reaches it. On short or narrow desktop
 * windows, with reduced motion, and once scrolled past, the same board is a strip you swipe or scroll sideways.
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
  // Once scrolled past, it stays the sideways strip: coming back up doesn't replay the whole ride
  const section = useRef<HTMLElement>(null);
  const past = useScrolledPast(section);
  const pinned = wide && !still && !past;

  return (
    <section id="journey" ref={section} className={`section jr${pinned ? ' section--pinned jr--pinned' : ''}`} aria-labelledby="journey-title">
      {pinned ? <Pinned /> : <Swipe />}
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
  const slow = typeof matchMedia === 'function' && matchMedia(TOUCH).matches ? 1.5 : 1;

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
    <div ref={outer} className="jr-outer" style={{ height: `calc(100vh + ${dist * slow}px)` }}>
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

/** Narrow screens, reduced motion, and the way back up: the same board as a strip you swipe or scroll sideways. */
function Swipe() {
  const still = useReducedMotion();
  const rail = useRef<HTMLDivElement>(null);
  const { scrollXProgress } = useScroll({ container: rail });
  const [lit, setLit] = useState(0);
  const [ends, setEnds] = useState({ start: true, end: false });
  useMotionValueEvent(scrollXProgress, 'change', (p) => {
    setLit(Math.round(p * (journey.length - 1)));
    const r = rail.current;
    if (r) setEnds({ start: r.scrollLeft < 4, end: r.scrollLeft + r.clientWidth >= r.scrollWidth - 4 });
  });
  const fill = useTransform(scrollXProgress, [0, 1], [0.03, 1]);
  // Mouse users get buttons; each press moves about two stops
  const nudge = (dir: number) => rail.current?.scrollBy({ left: dir * 560, behavior: still ? 'auto' : 'smooth' });

  return (
    <>
      <div className="container">
        <Head />
      </div>
      <div ref={rail} className="jr-rail jr-rail--swipe" tabIndex={0} role="region" aria-label="Journey timeline — scroll sideways">
        <ol className="jr-track" role="list">
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
        </ol>
      </div>
      <div className="container jr-nav">
        <span className="jr-hint mono" aria-hidden="true">
          {String(lit + 1).padStart(2, '0')} / {String(journey.length).padStart(2, '0')}
        </span>
        <span className="jr-nav-btns">
          <button type="button" className="jr-arrow" onClick={() => nudge(-1)} disabled={ends.start} aria-label="Earlier stops">
            <ArrowLeft size={18} aria-hidden="true" />
          </button>
          <button type="button" className="jr-arrow" onClick={() => nudge(1)} disabled={ends.end} aria-label="Later stops">
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </span>
      </div>
    </>
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
