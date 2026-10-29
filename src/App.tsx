import { useEffect } from 'react';
import { MotionConfig } from 'motion/react';
import { Nav } from './components/layout/Nav';
import { Footer } from './components/layout/Footer';
import { Intro } from './components/layout/Intro';
import { ProjectDialog } from './components/projects/ProjectDialog';
import { VisualDefs } from './components/visuals/ProjectVisual';
import { SignalTrace } from './components/visuals/SignalTrace';
import { ProjectRouteProvider } from './hooks/useProjectRoute';
import { sectionComponents, visibleSections } from './sections/registry';
import { ChapterContext } from './lib/chapter';

const navItems = visibleSections.filter((s) => s.nav).map(({ id, label }) => ({ id, label }));
const chapters = visibleSections.map(({ id, label }) => ({ id, label }));
const sectionIds = chapters.map((s) => s.id);
const TOUCH = '(max-width: 900px) and (pointer: coarse)';

/** Whether a pinned section lies between the current scroll position and `el`. */
const crossesPin = (el: Element) => {
  const to = el.getBoundingClientRect().top;
  const [lo, hi] = to < 0 ? [to, 0] : [0, to];
  return [...document.querySelectorAll('.section--pinned')].some((pin) => {
    const r = pin.getBoundingClientRect();
    return pin !== el && r.top < hi && r.bottom > lo;
  });
};

export default function App() {
  // Sections below the fold use content-visibility:auto (base.css), so their heights are estimates until
  // first rendered. After an in-page jump, re-align once scrolling settles in case an estimate moved the target;
  // a re-align can render more sections on the way, so it repeats (a few times at most) until the target lands.
  useEffect(() => {
    let target: string | null = null;
    let tries = 0;
    let timer = 0;
    const settle = () => {
      const el = target ? document.getElementById(target) : null;
      if (!el) return;
      const offset = el.getBoundingClientRect().top - (parseFloat(getComputedStyle(el).scrollMarginTop) || 0);
      if (Math.abs(offset) > 4 && tries++ < 4) el.scrollIntoView();
      else target = null;
    };
    const onScroll = () => {
      window.clearTimeout(timer);
      if (target) timer = window.setTimeout(settle, 150);
    };
    // The reader scrolling on their own ends the jump: never pull them back to where it landed
    const letGo = () => {
      target = null;
      window.clearTimeout(timer);
    };
    const keys = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ']);
    const onKey = (e: KeyboardEvent) => {
      if (keys.has(e.key)) letGo();
    };
    // A press on the page's own scrollbar lands on <html>
    const onPress = (e: PointerEvent) => {
      if (e.target === document.documentElement) letGo();
    };
    const onClick = (e: MouseEvent) => {
      const id = (e.target as Element).closest?.('a[href^="#"]')?.getAttribute('href')?.slice(1);
      if (id && sectionIds.includes(id)) {
        target = id;
        tries = 0;
        // On phones, a smooth scroll past a pinned section would play its whole ride on the way; jump instead
        const el = document.getElementById(id);
        if (el && matchMedia(TOUCH).matches && crossesPin(el)) {
          e.preventDefault();
          history.pushState(null, '', `#${id}`);
          el.scrollIntoView({ behavior: 'instant' });
        }
      }
    };
    const initial = location.hash.slice(1);
    if (sectionIds.includes(initial)) {
      target = initial;
      tries = 0;
      document.getElementById(initial)?.scrollIntoView({ behavior: 'instant' });
    }
    document.addEventListener('click', onClick);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', letGo, { passive: true });
    window.addEventListener('touchstart', letGo, { passive: true });
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPress, { passive: true });
    return () => {
      document.removeEventListener('click', onClick);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', letGo);
      window.removeEventListener('touchstart', letGo);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPress);
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <ProjectRouteProvider>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <div className="atmosphere" aria-hidden="true">
          <i className="aura aura--1" />
          <i className="aura aura--2" />
          <i className="aura aura--3" />
        </div>
        <VisualDefs />
        <Intro />
        <Nav items={navItems} chapters={chapters} />
        <main id="main" tabIndex={-1}>
          <SignalTrace />
          {visibleSections.map((s, i) => {
            const Section = sectionComponents[s.id];
            return (
              <ChapterContext.Provider key={s.id} value={i}>
                <Section />
              </ChapterContext.Provider>
            );
          })}
        </main>
        <Footer items={navItems} />
        <ProjectDialog />
      </ProjectRouteProvider>
    </MotionConfig>
  );
}
