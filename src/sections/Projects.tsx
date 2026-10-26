import { useMemo, useState } from 'react';
import { projects } from '../content';
import { Reveal, SectionHead } from '../components/ui/Reveal';
import { ProjectCard } from '../components/projects/ProjectCard';
import './projects.css';

/** Category filters appear automatically once there are enough projects for them to help. */
const MIN_FOR_FILTERS = 8;

export function Projects() {
  const [filter, setFilter] = useState('All');
  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    projects.forEach((p) => counts.set(p.category, (counts.get(p.category) ?? 0) + 1));
    const useful = projects.length >= MIN_FOR_FILTERS && [...counts.values()].some((n) => n > 1);
    return useful ? ['All', ...counts.keys()] : [];
  }, []);

  const visible = filter === 'All' ? projects : projects.filter((p) => p.category === filter);
  const [featured, ...rest] = filter === 'All' && visible[0]?.featured ? visible : [undefined, ...visible];

  return (
    <section id="projects" className="section" aria-labelledby="projects-title">
      <div className="container">
        <SectionHead
          id="projects-title"
          eyebrow="Projects"
          title="Things I have built, researched and shipped"
          lead="Products, research and hackathon builds. Open any card for the short case study."
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

        <ul className="pj-grid" role="list">
          {featured && (
            <Reveal as="li" className="pj-featured">
              <ProjectCard project={featured} featured />
            </Reveal>
          )}
          {rest.map((p, i) =>
            p ? (
              <Reveal as="li" key={p.slug} delay={(i % 3) * 0.06}>
                <ProjectCard project={p} />
              </Reveal>
            ) : null,
          )}
        </ul>
      </div>
    </section>
  );
}
