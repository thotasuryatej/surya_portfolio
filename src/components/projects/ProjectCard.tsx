import type { MouseEvent } from 'react';
import { ArrowUpRight, Award } from 'lucide-react';
import type { Project } from '../../content/schema';
import { Badge, TagList } from '../ui/Badge';
import { ProjectVisual } from '../visuals/ProjectVisual';
import { formatPeriod } from '../../lib/format';
import { projectStatusColor } from '../../lib/status';
import { useProjectRoute } from '../../hooks/useProjectRoute';
import { asset } from '../../lib/asset';

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

function useOpen(slug: string) {
  const { open } = useProjectRoute();
  return (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    open(slug);
  };
}

/**
 * A project in the showcase. Either way it is a real link (#project/<slug>), so it can be opened, copied or shared.
 * - spotlight: a large composition, illustration and text side by side, alternating sides down the page
 * - index: one scannable row in the list that follows
 */
export function ProjectCard({ project, index, total, variant, flip }: { project: Project; index: number; total: number; variant: 'spotlight' | 'index'; flip?: boolean }) {
  const onClick = useOpen(project.slug);
  const live = project.status === 'In progress';
  const link = (
    <a href={`#project/${project.slug}`} className="pc-link" onClick={onClick}>
      {project.title}
    </a>
  );

  if (variant === 'index') {
    return (
      <article className="pc pi" data-project-card={project.slug}>
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
    <article className={`pc ps${flip ? ' ps--flip' : ''}`} data-project-card={project.slug}>
      <div className="pc-media ps-media">
        <div className="ps-frame">
          <ProjectMedia project={project} />
        </div>
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
