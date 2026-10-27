import { prefersReducedMotion } from './motion';

type ViewTransition = { ready: Promise<void>; finished: Promise<void> };
type ViewTransitionDoc = Document & { startViewTransition?: (cb: () => void | Promise<void>) => ViewTransition };

/** True when the browser can run a View Transition and the visitor has not asked for less motion. */
export const canTransition = () => !!(document as ViewTransitionDoc).startViewTransition && !prefersReducedMotion();

/**
 * Runs `update` inside a View Transition, tagging <html> with `className` for the duration so CSS can style
 * that kind of transition only. Falls back to running `update` directly.
 */
export function viewTransition(update: () => void | Promise<void>, className: string, after?: () => void) {
  const doc = document as ViewTransitionDoc;
  if (!canTransition()) {
    void update();
    after?.();
    return null;
  }
  const root = document.documentElement;
  root.classList.add(className);
  const vt = doc.startViewTransition!(update);
  vt.finished
    .catch(() => {})
    .finally(() => {
      root.classList.remove(className);
      after?.();
    });
  return vt;
}

