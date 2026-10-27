import { useCallback, useRef, useState } from 'react';
import { useMotionValueEvent, useScroll, useSpring } from 'motion/react';

/**
 * A pinned section that steps through `n` items as the page scrolls (the Journey pattern, in steps).
 * The outer element is tall; its sticky child stays on screen while scroll progress picks the step.
 * `goTo` (clicks, arrow keys) selects a step at once and scrolls to where that step lives, so the
 * scroll position and the selection never disagree.
 */
export function useScrollSteps(n: number) {
  const outer = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  // While a jump is scrolling, ignore the steps it passes through on the way
  const jump = useRef<{ to: number; until: number } | null>(null);

  const { scrollYProgress } = useScroll({ target: outer, offset: ['start start', 'end end'] });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.35 });

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const at = Math.min(n - 1, Math.max(0, Math.floor(p * n)));
    const j = jump.current;
    if (j) {
      if (at !== j.to && performance.now() < j.until) return;
      jump.current = null;
    }
    setStep(at);
  });

  const goTo = useCallback(
    (i: number) => {
      setStep(i);
      const el = outer.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + scrollY;
      const travel = el.offsetHeight - innerHeight;
      jump.current = { to: i, until: performance.now() + 1200 };
      scrollTo({ top: top + (travel * (i + 0.5)) / n, behavior: 'smooth' });
    },
    [n],
  );

  return { outer, step, goTo, progress };
}
