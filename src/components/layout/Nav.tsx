import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll, type Variants } from 'motion/react';
import { ease } from '../../lib/motion';
import { Check, Download, Mail, Plus } from 'lucide-react';
import { profile } from '../../content';
import { ThemeToggle } from './ThemeToggle';
import { Monogram } from '../brand/Monogram';
import { BrandIcon } from '../ui/BrandIcon';
import { useActiveSection } from '../../hooks/useActiveSection';
import { useLiquidGlass } from '../ui/LiquidGlass';
import { ISLAND_EVENT } from '../../lib/island';
import './nav.css';
import { asset } from '../../lib/asset';

export interface NavItem {
  id: string;
  label: string;
}

const spring = { type: 'spring', stiffness: 380, damping: 30 } as const;
const island: Variants = {
  out: { opacity: 0, scale: 0.6, y: -10, transition: { duration: 0.2 } },
  in: { opacity: 1, scale: 1, y: 0, transition: spring },
};
const swap = {
  initial: { opacity: 0, y: 10, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -10, filter: 'blur(4px)' },
  transition: { duration: 0.28, ease: ease.out },
};

/** Short notices from elsewhere on the page (an address copied, the theme switched) that the island shows for a moment. */
function useNotice() {
  const [notice, setNotice] = useState<string | null>(null);
  useEffect(() => {
    let timer = 0;
    const on = (e: Event) => {
      setNotice((e as CustomEvent<string>).detail);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setNotice(null), 2200);
    };
    window.addEventListener(ISLAND_EVENT, on);
    return () => {
      window.removeEventListener(ISLAND_EVENT, on);
      window.clearTimeout(timer);
    };
  }, []);
  return notice;
}

const list: Variants = { show: { transition: { staggerChildren: 0.045, delayChildren: 0.12 } } };
const row: Variants = {
  hide: { opacity: 0, x: 28 },
  show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: ease.out } },
};

/**
 * The top bar is just the mark and three controls; the sections live in one menu, the same on every screen size:
 * a panel from the right edge with large links numbered like the section chapters, over a dimmed page.
 * Escape, the scrim or any link closes it, and focus returns to the Menu button.
 *
 * Between them, once the hero is left behind, an island: a small glass pill that names the chapter you are in,
 * fills along its bottom edge with your progress down the page, and morphs for a moment to show a notice.
 * It opens the same menu. Wide screens only; on a phone the bar has no room for it.
 */
export function Nav({ items, chapters }: { items: NavItem[]; chapters: NavItem[] }) {
  const sectionIds = chapters.map((c) => c.id);
  const active = useActiveSection(sectionIds);
  const notice = useNotice();
  const { scrollY, scrollYProgress } = useScroll();
  const markRef = useRef<HTMLAnchorElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const islandRef = useRef<HTMLButtonElement>(null);
  const glass = [useLiquidGlass(markRef), useLiquidGlass(endRef), useLiquidGlass(islandRef)];
  const [scrolled, setScrolled] = useState(() => scrollY.get() > 24);
  const [open, setOpen] = useState(false);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLElement>(null);

  // Always on screen; once the page scrolls under it, the controls sit on small plates (nav.css).
  // Read from motion's scroll value, sampled once a frame: reading scrollY in every scroll event forced a layout each time.
  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 24));

  // While open: focus the first link, keep Tab inside the panel, close on Escape.
  useEffect(() => {
    if (!open) return;
    const focusables = () => [...(panel.current?.querySelectorAll<HTMLElement>('a[href], button') ?? [])];
    focusables()[0]?.focus({ preventScroll: true });
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        menuBtn.current?.focus();
        return;
      }
      if (e.key !== 'Tab') return;
      const f = [menuBtn.current!, ...focusables()];
      const i = f.indexOf(document.activeElement as HTMLElement);
      if (e.shiftKey && i <= 0) {
        e.preventDefault();
        f[f.length - 1].focus();
      } else if (!e.shiftKey && i === f.length - 1) {
        e.preventDefault();
        f[0].focus();
      }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [open]);

  // "Mindset" isn't in the menu; mark its neighbour so the menu always shows where you are.
  const navIds = items.map((i) => i.id);
  const current = navIds.includes(active) ? active : (navIds[Math.max(0, sectionIds.indexOf(active) - 1)] ?? active);
  const close = () => setOpen(false);
  const chapter = chapters.find((c) => c.id === active);
  const showIsland = !open && ((scrolled && active !== sectionIds[0]) || !!notice);

  return (
    <header
      className={`nav${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}>
      {glass}
      <div className="nav-bar">
        <a href="#home" ref={markRef} className="nav-mark" aria-label={`${profile.fullName} — back to top`} onClick={close}>
          <Monogram size={27} />
        </a>

        <motion.button
          ref={islandRef}
          type="button"
          className="nav-island"
          layout
          style={{ borderRadius: 999 }}
          variants={island}
          initial="out"
          animate={showIsland ? 'in' : 'out'}
          transition={spring}
          inert={!showIsland}
          aria-hidden={!showIsland}
          aria-label={chapter ? `In ${chapter.label}. Open the section menu` : 'Open the section menu'}
          onClick={() => setOpen(true)}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {notice ? (
              <motion.span key={`n-${notice}`} className="isl-content" {...swap}>
                <span className="isl-dot isl-dot--ok" aria-hidden="true">
                  <Check size={14} />
                </span>
                {notice}
              </motion.span>
            ) : (
              <motion.span key={active} className="isl-content" {...swap}>
                <span className="isl-dot mono" aria-hidden="true">
                  {String(Math.max(0, sectionIds.indexOf(active))).padStart(2, '0')}
                </span>
                {chapter?.label}
              </motion.span>
            )}
          </AnimatePresence>
          <motion.span className="isl-bar" aria-hidden="true" style={{ scaleX: scrollYProgress }} />
        </motion.button>

        <div className="nav-end" ref={endRef}>
          <ThemeToggle />
          <a className="nav-resume" href={asset(profile.resume.file)} download={profile.resume.downloadName}>
            <Download size={16} aria-hidden="true" />
            <span>Resume</span>
          </a>
          <button
            ref={menuBtn}
            type="button"
            className="nav-menu-btn"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen((o) => !o)}
          >
            <span className="nav-menu-label">{open ? 'Close' : 'Menu'}</span>
            <Plus size={16} aria-hidden="true" className="nav-menu-icon" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            key="scrim"
            className="nav-scrim"
            aria-hidden="true"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
        {open && (
          <motion.nav
            key="panel"
            ref={panel}
            id="site-menu"
            aria-label="Sections"
            className="nav-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.5, ease: ease.inOut }}
          >
            <p className="nav-panel-label mono">Index</p>
            <motion.ul role="list" className="nav-panel-list" variants={list} initial="hide" animate="show">
              {items.map((item) => (
                <motion.li key={item.id} variants={row}>
                  <a
                    href={`#${item.id}`}
                    className="nav-panel-link"
                    aria-current={current === item.id ? 'location' : undefined}
                    onClick={close}
                  >
                    <span className="nav-panel-num mono" aria-hidden="true">
                      {String(sectionIds.indexOf(item.id)).padStart(2, '0')}
                    </span>
                    {item.label}
                  </a>
                </motion.li>
              ))}
            </motion.ul>

            <div className="nav-panel-foot">
              <p className="nav-panel-label mono">Get in touch</p>
              <a className="nav-panel-mail" href={`mailto:${profile.email}`}>
                <Mail size={16} aria-hidden="true" />
                {profile.email}
              </a>
              <ul role="list" className="nav-panel-socials">
                {profile.socials.map((s) => (
                  <li key={s.href}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer">
                      <BrandIcon icon={s.icon} />
                      {s.label}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
