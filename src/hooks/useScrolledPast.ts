import { useEffect, useLayoutEffect, useState, type RefObject } from 'react';

/*
 * Pinned sections take several screens of scroll to play through. Once the reader has scrolled past one,
 * scrolling back up shouldn't make them play it through again, so the section swaps to its compact version.
 * The swap waits until scrolling stops (a smooth jump keeps its target), happens while the section is above
 * the screen, and the page then moves by the height it lost, so nothing on screen jumps. Several sections can
 * swap in one pass and commit in separate frames, so the section on screen is held in place for a moment,
 * through every layout change, rather than corrected once.
 */
const watched = new Map<Element, () => void>();
let timer = 0;

/** The section on screen when the swap began, and where its top was */
let anchor: { el: Element; top: number } | null = null;
const holder = typeof ResizeObserver === 'function' ? new ResizeObserver(() => hold()) : null;
const release = () => {
  anchor = null;
  holder?.disconnect();
  removeEventListener('wheel', release);
  removeEventListener('touchstart', release);
  removeEventListener('keydown', release);
};
const hold = () => {
  if (!anchor) return;
  const d = anchor.el.getBoundingClientRect().top - anchor.top;
  if (Math.abs(d) > 1) scrollBy({ top: d, behavior: 'instant' });
};

const settle = () => {
  const past = [...watched].filter(([el]) => el.getBoundingClientRect().bottom <= 0);
  if (!past.length) return;
  const el = [...document.querySelectorAll('main > section')].find((s) => s.getBoundingClientRect().bottom > 0);
  if (el) {
    release();
    anchor = { el, top: el.getBoundingClientRect().top };
    holder?.observe(document.body);
    // Let go once the swaps are done, or as soon as the reader scrolls on their own
    addEventListener('wheel', release, { passive: true });
    addEventListener('touchstart', release, { passive: true });
    addEventListener('keydown', release);
    window.setTimeout(release, 1000);
  }
  for (const [el, mark] of past) {
    watched.delete(el);
    mark();
  }
};
const onScroll = () => {
  clearTimeout(timer);
  timer = window.setTimeout(settle, 180);
};

export function useScrolledPast(ref: RefObject<Element | null>) {
  const [past, setPast] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || past) return;
    watched.set(el, () => setPast(true));
    if (watched.size === 1) addEventListener('scroll', onScroll, { passive: true });
    return () => {
      watched.delete(el);
      if (!watched.size) removeEventListener('scroll', onScroll);
    };
  }, [ref, past]);

  // Keep the section on screen where it was, before the browser paints the shorter page
  useLayoutEffect(() => {
    if (past) hold();
  }, [past]);

  return past;
}
