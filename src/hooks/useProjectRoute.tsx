import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { viewTransition } from '../lib/viewTransition';
import { prefersReducedMotion } from '../lib/motion';

/**
 * Case studies open in a dialog with a shareable URL: /#project/<slug>.
 * The browser back button closes the dialog.
 *
 * Opening and closing are plain CSS animations on the dialog (projects.css): a View Transition there has to
 * snapshot the whole page twice, which froze the page for a few hundred ms. Prev/next inside the dialog still
 * cross-fades with one, as the dialog covers the page by then.
 */
const PREFIX = '#project/';
const slugFromHash = () => (location.hash.startsWith(PREFIX) ? decodeURIComponent(location.hash.slice(PREFIX.length)) : null);
/** Matches the dialog's exit animation in projects.css. */
const EXIT_MS = 220;

interface Ctx {
  openSlug: string | null;
  open: (slug: string) => void;
  close: () => void;
}
const ProjectRouteContext = createContext<Ctx | null>(null);

export function ProjectRouteProvider({ children }: { children: ReactNode }) {
  const [openSlug, setOpenSlug] = useState<string | null>(slugFromHash);
  const pushed = useRef(false);

  useEffect(() => {
    const onHash = () => setOpenSlug(slugFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const open = useCallback((slug: string) => {
    const switching = !!slugFromHash();
    const go = () => {
      if (switching) {
        // Switching between projects inside the dialog: don't stack history entries.
        history.replaceState(null, '', PREFIX + slug);
      } else {
        history.pushState(null, '', PREFIX + slug);
        pushed.current = true;
      }
      flushSync(() => setOpenSlug(slug));
    };
    if (switching) viewTransition(go, 'vt-project-swap');
    else go();
  }, []);

  const close = useCallback(() => {
    const doClose = () => {
      if (!slugFromHash()) return setOpenSlug(null);
      if (pushed.current) {
        pushed.current = false;
        history.back();
      } else {
        // Arrived from a shared link: land on the projects section instead of leaving the site.
        history.replaceState(null, '', location.pathname + location.search + '#projects');
        setOpenSlug(null);
        document.getElementById('projects')?.scrollIntoView();
      }
    };
    // Play the exit, then close; ProjectDialog clears the flag once the dialog has closed.
    const d = document.querySelector<HTMLDialogElement>('dialog.dlg[open]');
    if (!d || prefersReducedMotion()) return doClose();
    if (d.hasAttribute('data-closing')) return;
    d.setAttribute('data-closing', '');
    window.setTimeout(doClose, EXIT_MS);
  }, []);

  return <ProjectRouteContext.Provider value={{ openSlug, open, close }}>{children}</ProjectRouteContext.Provider>;
}

export function useProjectRoute() {
  const ctx = useContext(ProjectRouteContext);
  if (!ctx) throw new Error('useProjectRoute must be used inside ProjectRouteProvider');
  return ctx;
}
