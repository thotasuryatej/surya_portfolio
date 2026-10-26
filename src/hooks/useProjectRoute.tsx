import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { canTransition, until, viewTransition } from '../lib/viewTransition';

/**
 * Case studies open in a dialog with a shareable URL: /#project/<slug>.
 * The browser back button closes the dialog.
 *
 * Where View Transitions are supported, a card's image and title morph into the dialog and back again
 * (names in projects.css); without a visible card the panel simply fades and lifts. Elsewhere, or with reduced
 * motion, the dialog's own CSS entrance plays.
 */
const PREFIX = '#project/';
const slugFromHash = () => (location.hash.startsWith(PREFIX) ? decodeURIComponent(location.hash.slice(PREFIX.length)) : null);

const PARTS = [
  ['.pc-media', 'pj-media'],
  ['.pc-title', 'pj-title'],
] as const;

const dialogOpen = () => !!document.querySelector('dialog.dlg[open]');

/** The visible card for a project, or null when it is off-screen (morphing to it would look like a jump). */
function cardFor(slug: string) {
  const card = document.querySelector<HTMLElement>(`[data-project-card="${CSS.escape(slug)}"]`);
  if (!card) return null;
  const r = card.getBoundingClientRect();
  return r.bottom > 0 && r.top < innerHeight ? card : null;
}
function nameCard(card: HTMLElement | null, on: boolean) {
  // The open dialog already carries these names; naming the card too would abort the transition.
  if (on && dialogOpen()) return;
  PARTS.forEach(([sel, name]) => {
    const el = card?.querySelector<HTMLElement>(sel);
    if (el) el.style.viewTransitionName = on ? name : '';
  });
}

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
    const card = switching ? null : cardFor(slug);
    if (!canTransition()) return go();
    nameCard(card, true);
    viewTransition(() => {
      nameCard(card, false);
      go();
    }, switching ? 'vt-project-swap' : 'vt-project');
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
    const slug = slugFromHash();
    if (!slug || !canTransition()) return doClose();
    const card = cardFor(slug);
    viewTransition(
      async () => {
        doClose();
        await until(() => !dialogOpen());
        nameCard(card, true);
      },
      'vt-project',
      () => nameCard(card, false),
    );
  }, []);

  return <ProjectRouteContext.Provider value={{ openSlug, open, close }}>{children}</ProjectRouteContext.Provider>;
}

export function useProjectRoute() {
  const ctx = useContext(ProjectRouteContext);
  if (!ctx) throw new Error('useProjectRoute must be used inside ProjectRouteProvider');
  return ctx;
}
