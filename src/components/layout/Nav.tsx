import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ease, spring } from '../../lib/motion';
import { Download, Menu, X } from 'lucide-react';
import { profile } from '../../content';
import { ThemeToggle } from './ThemeToggle';
import { useActiveSection } from '../../hooks/useActiveSection';
import { usePointerLight } from '../../hooks/usePointerLight';
import './nav.css';
import { asset } from '../../lib/asset';

export interface NavItem {
  id: string;
  label: string;
}

export function Nav({ items, sectionIds }: { items: NavItem[]; sectionIds: string[] }) {
  const active = useActiveSection(sectionIds);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const bar = useRef<HTMLDivElement>(null);
  const menuBtn = useRef<HTMLButtonElement>(null);
  usePointerLight(bar);

  // Hide while scrolling down, come back on any scroll up (and always near the top).
  useEffect(() => {
    let last = window.scrollY;
    const on = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      if (Math.abs(y - last) < 6) return;
      setHidden(y > last && y > 120);
      last = y;
    };
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  // Close the mobile menu on Escape and when the viewport grows.
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        menuBtn.current?.focus();
      }
    };
    const mq = matchMedia('(min-width: 961px)');
    const resize = () => mq.matches && setOpen(false);
    window.addEventListener('keydown', key);
    mq.addEventListener('change', resize);
    return () => {
      window.removeEventListener('keydown', key);
      mq.removeEventListener('change', resize);
    };
  }, [open]);

  // "Mindset" isn't in the nav; highlight its neighbour so the nav never goes blank.
  const navIds = items.map((i) => i.id);
  const current = navIds.includes(active) ? active : navIds[Math.max(0, sectionIds.indexOf(active) - 1)] ?? active;

  return (
    <header className={`nav${scrolled ? ' is-scrolled' : ''}${hidden && !open ? ' is-hidden' : ''}`} onFocus={() => setHidden(false)}>
      <div ref={bar} className="nav-bar glass glass--strong glass--pill">
        <a href="#home" className="nav-mark" aria-label={`${profile.fullName} — back to top`} onClick={() => setOpen(false)}>
          <span className="nav-name">{profile.fullName}</span>
        </a>

        <nav aria-label="Main" className="nav-links">
          <ul role="list">
            {items.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`} className="nav-link" aria-current={current === item.id ? 'location' : undefined}>
                  {current === item.id && (
                    <motion.span layoutId="nav-pill" className="nav-pill" transition={spring.snappy} />
                  )}
                  <span className="nav-link-text">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="nav-end">
          <ThemeToggle />
          <a className="nav-resume" href={asset(profile.resume.file)} download={profile.resume.downloadName}>
            <Download size={16} aria-hidden="true" />
            <span>Resume</span>
          </a>
          <button
            ref={menuBtn}
            type="button"
            className="icon-btn nav-menu-btn"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-menu"
            aria-label="Mobile"
            className="nav-sheet glass glass--strong"
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: ease.out }}
          >
            <ul role="list">
              {items.map((item, i) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="nav-sheet-link"
                    aria-current={current === item.id ? 'location' : undefined}
                    onClick={() => setOpen(false)}
                  >
                    <span className="mono">{String(i + 1).padStart(2, '0')}</span>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
