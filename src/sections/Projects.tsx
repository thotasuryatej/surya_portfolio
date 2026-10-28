import { useMemo, useState } from 'react';
import { projects } from '../content';
import { Reveal, SectionHead } from '../components/ui/Reveal';
import { ProjectCard } from '../components/projects/ProjectCard';
import './projects.css';

/** Category filters appear automatically once there are enough projects for them to help. */
const MIN_FOR_FILTERS = 8;
/** How many projects get a large composition before the list. */
const SPOTLIGHT = 4;

export function Projects() {
  const [filter, setFilter] = useState('All');
  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    projects.forEach((p) => counts.set(p.category, (counts.get(p.category) ?? 0) + 1));
    const useful = projects.length >= MIN_FOR_FILTERS && [...counts.values()].some((n) => n > 1);
    return useful ? ['All', ...counts.keys()] : [];
  }, []);

  const visible = filter === 'All' ? projects : projects.filter((p) => p.category === filter);
  // The first few are composed large; the rest follow as a list that is quick to scan
  const spotlight = visible.slice(0, SPOTLIGHT);
  const index = visible.slice(SPOTLIGHT);

  return (
    <section id="projects" className="section" aria-labelledby="projects-title">
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
      </div>
    </section>
  );
}
