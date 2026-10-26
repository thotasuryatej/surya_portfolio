/**
 * Motion tokens for Motion (motion/react) components — the JS side of the --ease-* / --t-* CSS tokens
 * in styles/tokens.css. Use these instead of inline curves so every transition feels like one system.
 * Reduced motion is handled globally by <MotionConfig reducedMotion="user"> in App.tsx.
 */
export const ease = {
  /** Decelerating — things arriving. Matches --ease-out. */
  out: [0.22, 1, 0.36, 1] as const,
  /** Symmetric — things moving between two resting places. Matches --ease-in-out. */
  inOut: [0.65, 0, 0.35, 1] as const,
};

export const dur = {
  fast: 0.16,
  med: 0.32,
  slow: 0.6,
  /** Section-level reveals. */
  reveal: 0.7,
};

export const spring = {
  /** Selection pills and indicators that follow the pointer or keyboard. */
  snappy: { type: 'spring', stiffness: 380, damping: 32 } as const,
  /** Larger surfaces (cards, panels) settling into place. */
  soft: { type: 'spring', stiffness: 170, damping: 26 } as const,
};

/** Fade-and-rise used for content entering the viewport. */
export const rise = (delay = 0, distance = 18) => ({
  initial: { opacity: 0, y: distance },
  animate: { opacity: 1, y: 0 },
  transition: { duration: dur.reveal, ease: ease.out, delay },
});

export const prefersReducedMotion = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
