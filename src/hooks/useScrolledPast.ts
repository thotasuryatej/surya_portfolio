import { useEffect, useLayoutEffect, useState, type RefObject } from 'react';

/*
 * Pinned sections take several screens of scroll to play through. Once the reader has scrolled past one,
 * scrolling back up shouldn't make them play it through again, so the section swaps to its compact version.
 * The swap waits until scrolling stops (a smooth jump keeps its target), happens while the section is above
 * the screen, and the page then moves by the height it lost, so nothing on screen jumps.
 */
const watched = new Map<Element, () => void>();
let before: { y: number; h: number } | null = null;
let timer = 0;

const settle = () => {
  const past = [...watched].filter(([el]) => el.getBoundingClientRect().bottom <= 0);
  if (!past.length) return;
  before = { y: scrollY, h: document.documentElement.scrollHeight };
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

  // Every section that swapped in this pass commits together; the first one to get here moves the page.
  useLayoutEffect(() => {
    if (!past || !before) return;
    const { y, h } = before;
    before = null;
    scrollTo({ top: y + document.documentElement.scrollHeight - h, behavior: 'instant' });
  }, [past]);

  return past;
}
