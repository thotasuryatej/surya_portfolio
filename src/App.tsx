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
const sectionIds = visibleSections.map((s) => s.id);

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
    const onClick = (e: MouseEvent) => {
      const id = (e.target as Element).closest?.('a[href^="#"]')?.getAttribute('href')?.slice(1);
      if (id && sectionIds.includes(id)) {
        target = id;
        tries = 0;
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
    return () => {
      document.removeEventListener('click', onClick);
      window.removeEventListener('scroll', onScroll);
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
        <Nav items={navItems} sectionIds={sectionIds} />
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
        <Footer />
        <ProjectDialog />
      </ProjectRouteProvider>
    </MotionConfig>
  );
}
