import { useCallback, useState } from 'react';
import { site } from '../content';
import { prefersReducedMotion } from './motion';
import { canTransition, viewTransition } from './viewTransition';

export type Theme = 'dark' | 'light';
const KEY = 'theme';

/** index.html sets data-theme before first paint; read it back so React starts in agreement. */
const current = (): Theme => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');

/** The browser UI (phone status bar) follows the visitor's theme rather than the OS. */
function syncThemeColor(theme: Theme) {
  const color = theme === 'light' ? site.themeColorLight : site.themeColor;
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((m) => (m.content = color));
}

// index.html picks the saved theme before the theme-color tag exists, so a saved light theme is synced here.
syncThemeColor(current());

function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  syncThemeColor(theme);
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
