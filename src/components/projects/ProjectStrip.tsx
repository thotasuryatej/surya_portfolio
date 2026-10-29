import { useLayoutEffect, useRef, useState, type MouseEvent } from 'react';
import { animate, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Award } from 'lucide-react';
import type { Project } from '../../content/schema';
import { Badge, TagList } from '../ui/Badge';
import { formatPeriod } from '../../lib/format';
import { projectStatusColor } from '../../lib/status';
import { useProjectRoute } from '../../hooks/useProjectRoute';
import { ProjectMedia } from './ProjectCard';
import { Step } from './ProjectGallery';

const nn = (n: number) => String(n).padStart(2, '0');

/**
 * Phones and tablets: the projects as a strip, swiped sideways like the Journey timeline or stepped with the arrows.
 * The browser does the scrolling and snapping, so it stays smooth on slower phones; a tap on a card opens it.
 * `from`: the project shown first (the last one, once the page has been scrolled past it).
 */
export function ProjectStrip({ projects, from = 0 }: { projects: Project[]; from?: number }) {
  const still = useReducedMotion();
  const rail = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(from);
  const n = projects.length;

  const pitch = () => {
    const cards = rail.current?.children;
    return cards && cards.length > 1 ? (cards[1] as HTMLElement).offsetLeft - (cards[0] as HTMLElement).offsetLeft : 1;
  };

  useLayoutEffect(() => {
    const r = rail.current;
    if (r && from > 0) r.scrollLeft = from * pitch();
    // Only where it starts; after that the reader moves it
  }, []);

  const frame = useRef(0);
  const onScroll = () => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const r = rail.current;
      if (!r) return;
      // On wide screens the last cards can't reach the left edge, so the end of the strip counts as the last one
      const end = r.scrollLeft >= r.scrollWidth - r.clientWidth - 4;
      setActive(end ? n - 1 : Math.min(n - 1, Math.max(0, Math.round(r.scrollLeft / pitch()))));
    });
  };

  // Each arrow press glides one project. Snapping is off while it glides, or the browser would grab the strip mid-way.
  const glide = useRef<ReturnType<typeof animate>>(null);
  const go = (i: number) => {
    const r = rail.current;
    if (!r) return;
    const to = Math.min(r.scrollWidth - r.clientWidth, Math.max(0, i * pitch()));
    glide.current?.stop();
    if (still) {
      r.scrollLeft = to;
      return;
    }
    r.style.scrollSnapType = 'none';
    glide.current = animate(r.scrollLeft, to, {
      duration: 0.6,
      ease: [0.33, 1, 0.68, 1],
      onUpdate: (v) => {
        r.scrollLeft = v;
      },
      onComplete: () => {
        r.style.scrollSnapType = '';
      },
    });
  };

  return (
    <div className="pst">
      <div ref={rail} className="pst-rail" tabIndex={0} role="region" aria-label="Projects — swipe sideways" onScroll={onScroll}>
        {projects.map((p, i) => (
          <StripCard key={p.slug} project={p} index={i} total={n} />
        ))}
      </div>
      <div className="container pst-nav">
        <p className="pg-count mono" aria-hidden="true">
          <span>{nn(active + 1)}</span> / {nn(n)}
        </p>
        <span className="pst-btns">
          <Step onClick={() => go(active - 1)} disabled={active === 0} label="Previous project">
            <ArrowLeft size={18} aria-hidden="true" />
          </Step>
          <Step onClick={() => go(active + 1)} disabled={active === n - 1} label="Next project">
            <ArrowRight size={18} aria-hidden="true" />
          </Step>
        </span>
      </div>
    </div>
  );
}

/** One project in the strip: the picture with its details under it. A tap anywhere opens the case study. */
function StripCard({ project, index, total }: { project: Project; index: number; total: number }) {
  const { open } = useProjectRoute();
  const live = project.status === 'In progress';
  const onLink = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    open(project.slug);
  };
  const onCard = (e: MouseEvent<HTMLElement>) => {
    if (e.button !== 0 || (e.target as Element).closest('a, button')) return;
    open(project.slug);
  };
  return (
    <article className="pc pst-card" data-project-card={project.slug} onClick={onCard}>
      <p className="sr-only">
        Project {index + 1} of {total}
      </p>
      <div className="pc-media pst-media" aria-hidden="true">
        <ProjectMedia project={project} />
      </div>
      <div className="pst-body">
        <div className="pc-meta">
          <Badge color={projectStatusColor[project.status]} live={live}>
            {project.status}
          </Badge>
          <span className="pc-cat mono">
            {project.category} · {formatPeriod(project.period)}
          </span>
        </div>
        <h3 className="pst-title">
          <a href={`#project/${project.slug}`} className="pc-link" onClick={onLink}>
            {project.title}
          </a>
        </h3>
        <p className="pst-sum">{project.summary}</p>
        {project.recognition && (
          <p className="pc-rec">
            <Award size={15} aria-hidden="true" />
            {project.recognition}
          </p>
        )}
        <TagList items={project.technologies} max={4} label="Technologies" />
        <span className="ps-cta pst-cta" aria-hidden="true">
          Read the case study <ArrowUpRight size={17} />
        </span>
      </div>
    </article>
  );
}
