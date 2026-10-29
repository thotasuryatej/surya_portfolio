import { useMemo, useRef, useState, type ReactNode } from 'react';
import { useReducedMotion } from 'motion/react';
import { projects } from '../content';
import { Reveal, SectionHead } from '../components/ui/Reveal';
import { ProjectCard } from '../components/projects/ProjectCard';
import { ProjectGallery } from '../components/projects/ProjectGallery';
import { ProjectStrip } from '../components/projects/ProjectStrip';
import type { Project } from '../content/schema';
import { useMedia } from '../hooks/useMedia';
import { useScrolledPast } from '../hooks/useScrolledPast';
import { useScrollSteps } from '../hooks/useScrollSteps';
import './projects.css';

/** Category filters appear automatically once there are enough projects for them to help. */
const MIN_FOR_FILTERS = 8;
/** How many projects get a large composition before the list. */
const SPOTLIGHT = 4;
/** "gallery": the fan of cards, about one screen tall. "showcase": the earlier large compositions and list. */
const LAYOUT: 'gallery' | 'showcase' = 'gallery';
/** Scroll-to-turn on desktops: the gallery pins and each bit of scrolling turns it a project. Off, so the page
    scrolls straight through (Journey and Mindset already pin); the arrows, names, drag and keys turn it instead. */
const SCROLL_TO_TURN = false;
/** Scroll each project takes while the gallery is pinned, in vh */
const STEP = 50;

export function Projects() {
  const [filter, setFilter] = useState('All');
  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    projects.forEach((p) => counts.set(p.category, (counts.get(p.category) ?? 0) + 1));
    const useful = projects.length >= MIN_FOR_FILTERS && [...counts.values()].some((n) => n > 1);
    return useful ? ['All', ...counts.keys()] : [];
  }, []);

  const visible = filter === 'All' ? projects : projects.filter((p) => p.category === filter);

  // On desktops the gallery pins and scrolling turns it. Once scrolled past, it stays the version with arrows:
  // coming back up doesn't replay the pin, and it shows the last project, where the reader left it.
  const still = useReducedMotion();
  const fits = useMedia('(min-width: 901px) and (min-height: 640px) and (hover: hover)');
  // Phones and tablets swipe a strip instead, like the Journey timeline
  const touch = useMedia('(max-width: 900px), (hover: none)');
  const section = useRef<HTMLElement>(null);
  const past = useScrolledPast(section);
  const pinned = SCROLL_TO_TURN && LAYOUT === 'gallery' && fits && !still && !past && visible.length > 1;
  const height = visible.length * STEP;

  const head = (
    <div className="container">
      <SectionHead
        id="projects-title"
        eyebrow="Projects"
        title="Things I have built, researched and shipped"
        lead="Products, research and hackathon builds. Open any one for the short case study."
      />

      {categories.length > 0 && (
        <div className="pj-filters" role="group" aria-label="Filter projects by category">
          {categories.map((c) => (
            <button key={c} type="button" className="dim-mode" aria-pressed={filter === c} onClick={() => setFilter(c)}>
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <section
      id="projects"
      ref={section}
      className={`section${pinned ? ' section--pinned' : ''}`}
      // Pinned, it is several screens tall; say so before it first renders (content-visibility) so jumps land right
      style={pinned ? { containIntrinsicSize: `auto calc(100vh + ${height}vh)` } : undefined}
      aria-labelledby="projects-title"
    >
      {pinned ? (
        <Pinned projects={visible} height={height} head={head} />
      ) : (
        <>
          {head}
          {LAYOUT === 'gallery' && touch ? (
            <ProjectStrip key={filter} projects={visible} from={SCROLL_TO_TURN && past ? visible.length - 1 : 0} />
          ) : LAYOUT === 'gallery' ? (
            <ProjectGallery projects={visible} from={SCROLL_TO_TURN && past ? visible.length - 1 : 0} />
          ) : (
            <div className="container">
              <Showcase visible={visible} />
            </div>
          )}
        </>
      )}
    </section>
  );
}

/** `height`: the extra scroll the pin takes, in vh */
function Pinned({ projects, height, head }: { projects: Project[]; height: number; head: ReactNode }) {
  const { outer, step, goTo } = useScrollSteps(projects.length);
  return (
    <div ref={outer} className="pg-outer" style={{ height: `calc(100vh + ${height}vh)` }}>
      {/* Pinned content stays put while the page scrolls, so the page-long signal trace doesn't tap into it */}
      <div className="pin-stage pg-pin" data-signal-skip="">
        {head}
        <ProjectGallery projects={projects} steer={{ step, goTo }} />
      </div>
    </div>
  );
}

/** The earlier layout: the first few projects composed large, the rest as a list that is quick to scan. */
function Showcase({ visible }: { visible: Project[] }) {
  const spotlight = visible.slice(0, SPOTLIGHT);
  const index = visible.slice(SPOTLIGHT);
  return (
    <>
      <ul className="ps-list" role="list">
        {spotlight.map((p, i) => (
          <li key={p.slug}>
            <ProjectCard project={p} index={i} total={visible.length} variant="spotlight" flip={i % 2 === 1} />
          </li>
        ))}
      </ul>

      {index.length > 0 && (
        <>
          <p className="pi-head mono">
            <span>More builds</span>
            <span aria-hidden="true">{index.length}</span>
          </p>
          <ul className="pi-list" role="list">
            {index.map((p, i) => (
              <Reveal as="li" key={p.slug} delay={i * 0.05}>
                <ProjectCard project={p} index={SPOTLIGHT + i} total={visible.length} variant="index" />
              </Reveal>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
