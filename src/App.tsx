import { useEffect } from 'react';
import { MotionConfig } from 'motion/react';
import { Nav } from './components/layout/Nav';
import { Footer } from './components/layout/Footer';
import { ProjectDialog } from './components/projects/ProjectDialog';
import { VisualDefs } from './components/visuals/ProjectVisual';
import { ProjectRouteProvider } from './hooks/useProjectRoute';
import { sectionComponents, visibleSections } from './sections/registry';

const navItems = visibleSections.filter((s) => s.nav).map(({ id, label }) => ({ id, label }));
const sectionIds = visibleSections.map((s) => s.id);

export default function App() {
  // Sections below the fold use content-visibility:auto (base.css), so their heights are estimates until
  // first rendered. After an in-page jump, re-align once scrolling settles in case an estimate moved the target.
  useEffect(() => {
    let target: string | null = null;
    let timer = 0;
    const settle = () => {
      const el = target ? document.getElementById(target) : null;
      target = null;
      if (!el) return;
      const offset = el.getBoundingClientRect().top - (parseFloat(getComputedStyle(el).scrollMarginTop) || 0);
      if (Math.abs(offset) > 4) el.scrollIntoView();
    };
    const onScroll = () => {
      window.clearTimeout(timer);
      if (target) timer = window.setTimeout(settle, 150);
    };
    const onClick = (e: MouseEvent) => {
      const id = (e.target as Element).closest?.('a[href^="#"]')?.getAttribute('href')?.slice(1);
      if (id && sectionIds.includes(id)) target = id;
    };
    const initial = location.hash.slice(1);
    if (sectionIds.includes(initial)) {
      target = initial;
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
        <Nav items={navItems} sectionIds={sectionIds} />
        <main id="main" tabIndex={-1}>
          {visibleSections.map((s) => {
            const Section = sectionComponents[s.id];
            return <Section key={s.id} />;
          })}
        </main>
        <Footer />
        <ProjectDialog />
      </ProjectRouteProvider>
    </MotionConfig>
  );
}
