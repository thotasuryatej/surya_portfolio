import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, ChevronLeft, ChevronRight, Download, Mail, Pause, Play, RotateCcw, X } from 'lucide-react';
import { about, hero, jobs, profile, projects } from '../../content';
import { useProjectRoute } from '../../hooks/useProjectRoute';
import { asset } from '../../lib/asset';
import { ease, prefersReducedMotion } from '../../lib/motion';
import { crossesPin } from '../../lib/scroll';
import { showProject, TOUR_START } from '../../lib/tour';
import './tour.css';

interface Stop {
  /** CSS selector of what to bring on screen */
  target: string;
  /** Where on screen it lands */
  block: ScrollLogicalPosition;
  kicker: string;
  title: string;
  text: string;
  /** How long the stop stays before the next one */
  ms: number;
  /** Project stops turn the gallery to this one and offer its case study */
  project?: string;
  contact?: boolean;
}

/** The first projects in the site's own order (featured first), so the tour follows the Projects section. */
const TOP = 3;
const job = jobs[0];

/** Everything here comes from the site's content files, so the tour never says more than the page does. */
const stops: Stop[] = [
  {
    target: '#home',
    block: 'start',
    kicker: 'Hello',
    title: `I'm ${profile.fullName}`,
    text: `${hero.eyebrow.join(' and ')} in ${profile.location}. ${hero.title}`,
    ms: 7000,
  },
  { target: '#about', block: 'start', kicker: 'About', title: about.statement ?? about.title, text: about.intro[0] ?? '', ms: 9000 },
  ...projects.slice(0, TOP).map(
    (p, i): Stop => ({
      target: '#projects .pg, #projects .pst',
      block: 'start',
      kicker: `Project ${i + 1} of ${TOP}`,
      title: p.title,
      text: p.summary,
      ms: 9000,
      project: p.slug,
    }),
  ),
  ...(job
    ? [{ target: '#experience', block: 'start', kicker: 'Now', title: `${job.role} at ${job.company}`, text: job.summary, ms: 7000 } as Stop]
    : []),
  {
    target: '#contact',
    block: 'start',
    kicker: 'Contact',
    title: 'Say hello',
    text: 'Write to me by email, or take the one-page résumé with you.',
    ms: 8000,
    contact: true,
  },
];

const total = Math.round(stops.reduce((t, s) => t + s.ms, 0) / 1000);

/** Keys that scroll the page: pressing one means the visitor is reading on their own, so the tour waits. */
const SCROLL_KEYS = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ']);

/**
 * A guided tour of the page's highlights in about a minute: who, about, the top projects, the current job and
 * how to get in touch. A small card at the bottom of the screen narrates while the page scrolls to each stop.
 * It pauses when the visitor scrolls themselves or opens a case study, and the controls step, pause and close.
 */
export function Tour() {
  const [on, setOn] = useState(false);
  const [i, setI] = useState(0);
  const [run, setRun] = useState(0);
  const [paused, setPaused] = useState(false);
  const [done, setDone] = useState(false);
  const { openSlug, open } = useProjectRoute();
  const card = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLElement>(null);
  const anim = useRef<Animation | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const hold = paused || !!openSlug;
  const holdRef = useRef(hold);
  holdRef.current = hold;

  useEffect(() => {
    const start = () => {
      opener.current = document.activeElement as HTMLElement | null;
      setI(0);
      setDone(false);
      setPaused(false);
      setRun((r) => r + 1);
      setOn(true);
    };
    window.addEventListener(TOUR_START, start);
    return () => window.removeEventListener(TOUR_START, start);
  }, []);

  const close = () => {
    setOn(false);
    opener.current?.focus?.({ preventScroll: true });
  };

  // Bring the stop on screen. Sections below the fold estimate their height until rendered, so check again after.
  useEffect(() => {
    if (!on) return;
    const stop = stops[i];
    const el = document.querySelector(stop.target);
    if (!el) return;
    // A smooth scroll past a pinned section would play its whole ride on the way; jump instead
    const instant = prefersReducedMotion() || crossesPin(el);
    el.scrollIntoView({ behavior: instant ? 'instant' : 'smooth', block: stop.block });
    const settle = () => {
      if (holdRef.current) return;
      const r = el.getBoundingClientRect();
      const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
      const off = stop.block === 'center' ? r.top + r.height / 2 - innerHeight / 2 : r.top - margin;
      if (Math.abs(off) > 6) el.scrollIntoView({ behavior: 'instant', block: stop.block });
    };
    const timers = [window.setTimeout(settle, 900), window.setTimeout(settle, 1600)];
    if (stop.project) {
      const slug = stop.project;
      timers.push(window.setTimeout(() => showProject(slug), instant ? 250 : 700));
    }
    return () => timers.forEach(window.clearTimeout);
  }, [on, i, run]);

  // The current segment of the progress bar is the stop's clock: when it fills, the tour moves on.
  // Web Animations rather than CSS, so the site's reduced-motion rule (which shortens CSS animations) leaves it be.
  useLayoutEffect(() => {
    const el = bar.current;
    if (!on || done || !el) return;
    const a = el.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: stops[i].ms, fill: 'forwards' });
    a.onfinish = () => (i < stops.length - 1 ? setI(i + 1) : setDone(true));
    if (holdRef.current) a.pause();
    anim.current = a;
    return () => {
      a.onfinish = null;
      a.cancel();
      anim.current = null;
    };
  }, [on, i, run, done]);

  useEffect(() => {
    const a = anim.current;
    if (!a) return;
    if (hold) a.pause();
    else a.play();
  }, [hold]);

  // The visitor taking over (wheel, touch, scroll keys outside the card) pauses; Escape closes.
  useEffect(() => {
    if (!on) return;
    const inCard = (e: Event) => !!card.current?.contains(e.target as Node);
    const take = (e: Event) => {
      if (!inCard(e)) setPaused(true);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !document.querySelector('dialog[open]')) close();
      else if (SCROLL_KEYS.has(e.key) && !inCard(e)) setPaused(true);
    };
    // Coming back to the tab doesn't make the visitor miss stops that played while away
    const onHide = () => document.hidden && setPaused(true);
    window.addEventListener('wheel', take, { passive: true });
    window.addEventListener('touchstart', take, { passive: true });
    window.addEventListener('keydown', onKey);
    document.addEventListener('visibilitychange', onHide);
    return () => {
      window.removeEventListener('wheel', take);
      window.removeEventListener('touchstart', take);
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('visibilitychange', onHide);
    };
  }, [on]);

  // Keyboard users land on the controls when the tour starts
  useEffect(() => {
    if (on) card.current?.querySelector<HTMLElement>('.tour-play')?.focus({ preventScroll: true });
  }, [on, run]);

  const go = (to: number) => {
    setDone(false);
    setPaused(false);
    setI(Math.max(0, Math.min(stops.length - 1, to)));
  };
  const replay = () => {
    go(0);
    setRun((r) => r + 1);
  };

  const stop = stops[i];
  const last = i === stops.length - 1;

  return (
    <AnimatePresence>
      {on && (
        <motion.div
          ref={card}
          className="tour glass"
          role="region"
          aria-label="Site tour"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.35, ease: ease.out }}
        >
          <div className="tour-bar" aria-hidden="true">
            {stops.map((_, k) => (
              <i key={`${run}-${k}`} className="tour-seg">
                <b ref={k === i ? bar : undefined} style={{ transform: k < i || (k === i && done) ? 'scaleX(1)' : 'scaleX(0)' }} />
              </i>
            ))}
          </div>

          <div className="tour-body" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: ease.out }}
              >
                <p className="tour-kicker mono">
                  <span>{stop.kicker}</span>
                  <span aria-hidden="true">
                    {i + 1} / {stops.length}
                  </span>
                </p>
                <p className="tour-title">{stop.title}</p>
                <p className="tour-text">{stop.text}</p>

                {stop.project && (
                  <div className="tour-actions">
                    <button type="button" className="tour-link" onClick={() => open(stop.project!)}>
                      Open the case study
                      <ArrowUpRight size={15} aria-hidden="true" />
                    </button>
                  </div>
                )}
                {stop.contact && (
                  <div className="tour-actions">
                    <a className="tour-link" href={`mailto:${profile.email}`}>
                      <Mail size={15} aria-hidden="true" />
                      Email me
                    </a>
                    <a className="tour-link" href={asset(profile.resume.file)} download={profile.resume.downloadName}>
                      <Download size={15} aria-hidden="true" />
                      Résumé (PDF)
                    </a>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="tour-controls">
            <button type="button" className="tour-btn" onClick={() => go(i - 1)} disabled={i === 0} aria-label="Previous stop">
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            {done ? (
              <button type="button" className="tour-btn tour-play" onClick={replay} aria-label="Replay the tour">
                <RotateCcw size={16} aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                className="tour-btn tour-play"
                onClick={() => setPaused((p) => !p)}
                aria-label={hold ? 'Play the tour' : 'Pause the tour'}
              >
                {hold ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
              </button>
            )}
            <button
              type="button"
              className="tour-btn"
              onClick={() => (last ? setDone(true) : go(i + 1))}
              disabled={last && done}
              aria-label="Next stop"
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
            <span className="tour-state mono" aria-hidden="true">
              {done ? 'End of tour' : hold ? 'Paused' : `${total}s tour`}
            </span>
            <button type="button" className="tour-btn tour-close" onClick={close} aria-label="Close the tour">
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
