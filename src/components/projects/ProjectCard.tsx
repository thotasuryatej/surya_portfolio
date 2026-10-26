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
    return <img className="pc-img" src={asset(project.cover.src)} alt={project.cover.alt} loading="lazy" decoding="async" />;
  }
  return (
    <>
      <ProjectVisual name={project.visual} seed={project.slug} />
      <span className="pc-illus mono">Illustration</span>
    </>
  );
}

/** A card is a real link (#project/<slug>), so it can be opened, copied or shared. */
export function ProjectCard({ project, featured }: { project: Project; featured?: boolean }) {
  const { open } = useProjectRoute();
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    open(project.slug);
  };
  const live = project.status === 'In progress';
  return (
    <article className={`pc surface${featured ? ' pc--featured' : ''}`} data-project-card={project.slug}>
      <div className="pc-media">
        <ProjectMedia project={project} />
      </div>
      <div className="pc-body">
        <div className="pc-meta">
          <Badge color={projectStatusColor[project.status]} live={live}>
            {project.status}
          </Badge>
          <span className="pc-cat mono">
            {project.category} · {formatPeriod(project.period)}
          </span>
        </div>
        <h3 className="pc-title">
          <a href={`#project/${project.slug}`} className="pc-link" onClick={onClick}>
            {project.title}
          </a>
        </h3>
        <p className="pc-sum">{project.summary}</p>
        {project.recognition && (
          <p className="pc-rec">
            <Award size={15} aria-hidden="true" />
            {project.recognition}
          </p>
        )}
        <div className="pc-foot">
          <TagList items={project.technologies} max={featured ? 5 : 3} label="Technologies" />
          <span className="pc-cta" aria-hidden="true">
            Case study <ArrowUpRight size={16} />
          </span>
        </div>
      </div>
    </article>
  );
}
