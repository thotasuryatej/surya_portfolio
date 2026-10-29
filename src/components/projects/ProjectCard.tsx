import { useRef, type MouseEvent, type PointerEvent } from 'react';
import { ArrowUpRight, Award } from 'lucide-react';
import type { Project } from '../../content/schema';
import { Badge, TagList } from '../ui/Badge';
import { ProjectVisual } from '../visuals/ProjectVisual';
import { formatPeriod } from '../../lib/format';
import { projectStatusColor } from '../../lib/status';
import { useProjectRoute } from '../../hooks/useProjectRoute';
import { asset } from '../../lib/asset';
import { useLiquidGlass } from '../ui/LiquidGlass';

export function ProjectMedia({ project }: { project: Project }) {
  if (project.cover?.type === 'image') {
    return (
      <>
        <img className="pc-img" src={asset(project.cover.src)} alt={project.cover.alt} loading="lazy" decoding="async" />
        <span className="pc-illus pc-shot mono">Screenshot</span>
      </>
    );
  }
  return (
    <>
      <ProjectVisual name={project.visual} seed={project.slug} />
      <span className="pc-illus mono">Illustration</span>
    </>
  );
}

const nn = (n: number) => String(n).padStart(2, '0');

/** Furthest the frame tips toward the pointer, in degrees */
const TILT = 7;

/**
 * While the mouse is over a spotlight frame, the frame tips toward it with a glare where the light would catch
 * (after TiltedCard in React Bits, https://github.com/DavidHDev/react-bits, MIT with Commons Clause,
 * Copyright (c) 2026 David Haz) and the "Read the case study" label follows the pointer.
 * The card's stretched link sits on top of the frame, so the card listens and the frame is measured.
 */
function useCursorLabel() {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse') return;
    const el = ref.current;
    if (!el) return;
    const { clientX, clientY } = e;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const x = clientX - r.left;
      const y = clientY - r.top;
      const inside = x >= 0 && y >= 0 && x <= r.width && y <= r.height;
      el.toggleAttribute('data-cursor', inside);
      el.style.setProperty('--cx', `${x}px`);
      el.style.setProperty('--cy', `${y}px`);
      // -1..1 from the centre; zero outside, so the frame settles back
      const nx = inside ? (x / r.width) * 2 - 1 : 0;
      const ny = inside ? (y / r.height) * 2 - 1 : 0;
      el.style.setProperty('--rx', `${(-ny * TILT).toFixed(2)}deg`);
      el.style.setProperty('--ry', `${(nx * TILT).toFixed(2)}deg`);
      el.style.setProperty('--nx', nx.toFixed(3));
      el.style.setProperty('--ny', ny.toFixed(3));
    });
  };
  const onPointerLeave = () => {
    cancelAnimationFrame(frame.current);
    const el = ref.current;
    if (!el) return;
    el.removeAttribute('data-cursor');
    for (const v of ['--rx', '--ry', '--nx', '--ny']) el.style.removeProperty(v);
  };
  return { ref, onPointerMove, onPointerLeave };
}

function useOpen(slug: string) {
  const { open } = useProjectRoute();
  return (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    open(slug);
  };
}

/**
 * A click anywhere on the card opens the project, the picture included. The stretched link can't promise that:
 * the scroll animation leaves a transform on the text column, which keeps the link's overlay inside it.
 * Clicks on the link itself, or that end a text selection, are left alone.
 */
function useCardClick(slug: string) {
  const { open } = useProjectRoute();
  return (e: MouseEvent<HTMLElement>) => {
    if (e.button !== 0 || (e.target as Element).closest('a, button') || getSelection()?.toString()) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey) window.open(`#project/${slug}`, '_blank', 'noopener');
    else open(slug);
  };
}

/**
 * A project in the showcase. Either way it is a real link (#project/<slug>), so it can be opened, copied or shared.
 * - spotlight: a large composition, illustration and text side by side, alternating sides down the page
 * - index: one scannable row in the list that follows
 */
export function ProjectCard({ project, index, total, variant, flip }: { project: Project; index: number; total: number; variant: 'spotlight' | 'index'; flip?: boolean }) {
  const onClick = useOpen(project.slug);
  const onCardClick = useCardClick(project.slug);
  const cursor = useCursorLabel();
  const pill = useRef<HTMLSpanElement>(null);
  const liquid = useLiquidGlass(pill, { enabled: variant === 'spotlight' });
  const live = project.status === 'In progress';
  const link = (
    <a href={`#project/${project.slug}`} className="pc-link" onClick={onClick}>
      {project.title}
    </a>
  );

  if (variant === 'index') {
    return (
      <article className="pc pi" data-project-card={project.slug} onClick={onCardClick}>
        <span className="pi-num mono" aria-hidden="true">
          {nn(index + 1)}
        </span>
        <div className="pi-main">
          <h3 className="pi-title">{link}</h3>
          <p className="pi-sum">{project.summary}</p>
        </div>
        <div className="pi-meta">
          <Badge color={projectStatusColor[project.status]} live={live}>
            {project.status}
          </Badge>
          <span className="pi-cat mono">
            {project.category} · {formatPeriod(project.period)}
          </span>
        </div>
        <div className="pc-media pi-thumb" aria-hidden="true">
          <ProjectVisual name={project.visual} seed={project.slug} />
        </div>
        <ArrowUpRight className="pi-arrow" size={20} aria-hidden="true" />
      </article>
    );
  }

  return (
    <article
      className={`pc ps${flip ? ' ps--flip' : ''}`}
      data-project-card={project.slug}
      onClick={onCardClick}
      onPointerMove={cursor.onPointerMove}
      onPointerLeave={cursor.onPointerLeave}
    >
      <div className="pc-media ps-media" ref={cursor.ref}>
        <div className="ps-frame">
          <ProjectMedia project={project} />
        </div>
        <span className="ps-glare" aria-hidden="true" />
        {liquid}
        <span ref={pill} className="ps-cursor" aria-hidden="true">
          Read the case study <ArrowUpRight size={15} />
        </span>
      </div>
      <div className="ps-body">
        <p className="ps-num mono" aria-hidden="true">
          <span>{nn(index + 1)}</span> / {nn(total)}
        </p>
        <div className="pc-meta">
          <Badge color={projectStatusColor[project.status]} live={live}>
            {project.status}
          </Badge>
          <span className="pc-cat mono">
            {project.category} · {formatPeriod(project.period)}
          </span>
        </div>
        <h3 className="ps-title">{link}</h3>
        <p className="ps-sum">{project.summary}</p>
        {project.recognition && (
          <p className="pc-rec">
            <Award size={15} aria-hidden="true" />
            {project.recognition}
          </p>
        )}
        <TagList items={project.technologies} max={5} label="Technologies" />
        <span className="ps-cta" aria-hidden="true">
          Read the case study <ArrowUpRight size={17} />
        </span>
      </div>
    </article>
  );
}
