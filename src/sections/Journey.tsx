import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { animate, motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { journey, journeyPhases, milestoneDate, projectBySlug } from '../content';
import { SectionHead } from '../components/ui/Reveal';
import { Icon } from '../components/ui/Icon';
import { useProjectRoute } from '../hooks/useProjectRoute';
import { asset } from '../lib/asset';
import { useScrolledPast } from '../hooks/useScrolledPast';
import { useLiquidGlass } from '../components/ui/LiquidGlass';
import './journey.css';

/** Where the section pins and scrolls sideways; phones get the strip, swiped or stepped with the arrows */
const WIDE = '(min-width: 900px)';

/** The phase that starts at stop i, with how many stops it spans; undefined mid-phase. */
const phaseAt = (i: number) => {
  const id = journey[i].phase;
  if (i > 0 && journey[i - 1].phase === id) return undefined;
  const phase = journeyPhases.find((p) => p.id === id)!;
  return { ...phase, count: journey.filter((m) => m.phase === id).length };
};

/**
 * Journey: a PCB trace from 2021 to now. On wide screens the section pins and scrolling moves
 * the board sideways; each milestone "powers on" as the current reaches it. On phones, narrow
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

/**
 * Keeps the rail's copy of the blueprint board on the page board's lines (both repeat every 120px): the shift is
 * set only when it changes, so while the rail is pinned it is set once and nothing repaints as the page scrolls.
 */
function useBoardShift(rail: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const r = rail.current;
    if (!r) return;
    let frame = 0;
    let last = '';
    const set = () => {
      frame = 0;
      const top = Math.round(r.getBoundingClientRect().top);
      if (top > innerHeight || top < -r.offsetHeight) return;
      const y = `${-(((top % 120) + 120) % 120)}px`;
      if (y !== last) r.style.setProperty('--grid-y', (last = y));
    };
    const on = () => {
      if (!frame) frame = requestAnimationFrame(set);
    };
    set();
    addEventListener('scroll', on, { passive: true });
    addEventListener('resize', on);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener('scroll', on);
      removeEventListener('resize', on);
    };
  }, [rail]);
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
  useBoardShift(rail);

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
  // Whole pixels only: a fractional slide smears the cards' text while it moves
  const x = useTransform(smooth, (p) => Math.round(-p * dist));
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

/** Narrow screens, reduced motion, and the way back up: the same board as a strip you swipe or scroll sideways. */
function Swipe() {
  const still = useReducedMotion();
  const rail = useRef<HTMLDivElement>(null);
  const { scrollXProgress } = useScroll({ container: rail });
  useBoardShift(rail);
  const [lit, setLit] = useState(0);
  const [ends, setEnds] = useState({ start: true, end: false });
  useMotionValueEvent(scrollXProgress, 'change', (p) => {
    setLit(Math.round(p * (journey.length - 1)));
    const r = rail.current;
    if (r) setEnds({ start: r.scrollLeft < 4, end: r.scrollLeft + r.clientWidth >= r.scrollWidth - 4 });
  });
  const fill = useTransform(scrollXProgress, [0, 1], [0.03, 1]);
  // Each arrow press glides one stop, slowly enough to read along the way. Snapping is off while it glides,
  // or the browser would grab the strip mid-way; a press during a glide carries on from where it is.
  const glide = useRef<ReturnType<typeof animate>>(null);
  const nudge = (dir: number) => {
    const r = rail.current;
    const stops = r?.querySelectorAll<HTMLElement>('.jr-stop');
    if (!r || !stops || stops.length < 2) return;
    const pitch = stops[1].offsetLeft - stops[0].offsetLeft;
    const max = r.scrollWidth - r.clientWidth;
    const to = Math.min(max, Math.max(0, (Math.round(r.scrollLeft / pitch) + dir) * pitch));
    glide.current?.stop();
    if (still) {
      r.scrollLeft = to;
      return;
    }
    r.style.scrollSnapType = 'none';
    glide.current = animate(r.scrollLeft, to, {
      duration: 0.75,
      ease: [0.33, 1, 0.68, 1],
      onUpdate: (v) => {
        r.scrollLeft = v;
      },
      onComplete: () => {
        r.style.scrollSnapType = '';
      },
    });
  };

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
  const card = useRef<HTMLSpanElement>(null);
  const liquid = useLiquidGlass(card);
  const body = (
    <>
      {liquid}
      <span className="jr-pad" aria-hidden="true" />
      <span className="jr-when mono">{milestoneDate(m)}</span>
      <span ref={card} className="jr-card glass glass--thin">
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
