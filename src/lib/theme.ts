import { useCallback, useEffect, useState } from 'react';
import { site } from '../content';
import { prefersReducedMotion } from './motion';
import { canTransition, viewTransition } from './viewTransition';

export type Theme = 'dark' | 'light';
const KEY = 'theme';

const stored = (): Theme | null => {
  try {
    const t = localStorage.getItem(KEY);
    return t === 'light' || t === 'dark' ? t : null;
  } catch {
    return null;
  }
};
const system = (): Theme => (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
/** index.html sets data-theme before first paint; read it back so React starts in agreement. */
const current = (): Theme => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');

function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  // Once the visitor chooses, the browser UI follows their choice rather than the OS.
  const color = theme === 'light' ? site.themeColorLight : site.themeColor;
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((m) => (m.content = color));
}

/**
 * Switches with a short View Transition cross-fade (opacity only, so the compositor runs it), a colour
 * cross-fade where View Transitions are missing, and instantly with reduced motion.
 */
function transition(theme: Theme) {
  if (prefersReducedMotion()) return apply(theme);
  if (!canTransition()) {
    const root = document.documentElement;
    root.classList.add('theme-fade');
    apply(theme);
    window.setTimeout(() => root.classList.remove('theme-fade'), 360);
    return;
  }
  viewTransition(() => apply(theme), 'vt-theme');
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(current);

  // Follow the OS setting until the visitor makes an explicit choice.
  useEffect(() => {
    const mq = matchMedia('(prefers-color-scheme: light)');
    const onChange = () => {
      if (stored()) return;
      apply(system());
      setTheme(system());
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const toggle = useCallback(() => {
    const next: Theme = current() === 'light' ? 'dark' : 'light';
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* private mode: the choice lasts for this page only */
    }
    transition(next);
    setTheme(next);
  }, []);

  return { theme, toggle };
}
