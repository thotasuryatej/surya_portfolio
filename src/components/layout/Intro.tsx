import { useEffect, useState } from 'react';
import { profile } from '../../content';
import './intro.css';

/*
 * The power-on: a short opening card (about 1.2s) before the hero — the name, one trace drawing to its pad,
 * then the card lifts away. It never blocks the page: the site is already rendered and clickable underneath
 * (the card ignores the pointer), any key, click, touch or wheel skips it, and it plays once per visit.
 * Skipped for reduced motion and for links that land on a section or case study.
 */
const KEY = 'intro-played';

export const introPlays = (() => {
  if (typeof window === 'undefined') return false;
  try {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    if (location.hash.length > 1) return false;
    if (sessionStorage.getItem(KEY)) return false;
    sessionStorage.setItem(KEY, '1');
  } catch {
    return false;
  }
  return true;
})();

/** Seconds the hero waits so its entrance follows the card lifting, not plays underneath it. */
export const introDelay = introPlays ? 0.95 : 0;

const HOLD = 900;

export function Intro() {
  const [state, setState] = useState<'on' | 'out' | 'done'>(introPlays ? 'on' : 'done');

  useEffect(() => {
    if (state !== 'on') return;
    const leave = () => setState('out');
    const timer = window.setTimeout(leave, HOLD);
    const skip = ['keydown', 'pointerdown', 'wheel', 'touchstart'] as const;
    skip.forEach((e) => window.addEventListener(e, leave, { once: true, passive: true }));
    return () => {
      window.clearTimeout(timer);
      skip.forEach((e) => window.removeEventListener(e, leave));
    };
  }, [state]);

  if (state === 'done') return null;
  return (
    <div className="intro" data-state={state} aria-hidden="true" onTransitionEnd={(e) => e.target === e.currentTarget && setState('done')}>
      <div className="intro-card">
        <p className="intro-name">{profile.name}</p>
        <svg className="intro-trace" viewBox="0 0 320 24" fill="none">
          <path d="M2 4 H150 L166 20 H306" pathLength={100} />
          <circle cx="311" cy="20" r="4" />
        </svg>
        <p className="intro-sub mono">The Inventor&rsquo;s Lab</p>
      </div>
    </div>
  );
}
