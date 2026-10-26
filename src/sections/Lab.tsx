import { useId, useState } from 'react';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import { labEntries, projectBySlug } from '../content';
import type { LabEntry } from '../content/schema';
import { Reveal, SectionHead } from '../components/ui/Reveal';
import { Badge } from '../components/ui/Badge';
import { formatDate } from '../lib/format';
import { labStatusColor } from '../lib/status';
import { useProjectRoute } from '../hooks/useProjectRoute';
import './lab.css';

function LabCard({ entry, index }: { entry: LabEntry; index: number }) {
  const [openDetails, setOpenDetails] = useState(false);
  const detailsId = useId();
  const { open } = useProjectRoute();
  const project = entry.relatedProject ? projectBySlug(entry.relatedProject) : undefined;
  const hasDetails = !!(entry.goal || entry.tried?.length || entry.discovered?.length || entry.built);
  const live = entry.status === 'Learning' || entry.status === 'Building' || entry.status === 'Exploring' || entry.status === 'Testing';

  return (
    <article className="lab surface">
      <header className="lab-head">
        <span className="lab-idx mono">LOG-{String(index).padStart(3, '0')}</span>
        <Badge color={labStatusColor[entry.status]} live={live}>
          {entry.status}
        </Badge>
      </header>
      <p className="lab-cat mono">{entry.category}</p>
      <h3 className="lab-title">{entry.title}</h3>
      <p className="lab-sum">{entry.summary}</p>

      {hasDetails && (
        <>
          <button
            type="button"
            className="about-more lab-toggle"
            aria-expanded={openDetails}
            aria-controls={detailsId}
            onClick={() => setOpenDetails((x) => !x)}
          >
            {openDetails ? 'Hide notes' : 'Read notes'}
            <ChevronDown size={16} aria-hidden="true" style={{ transform: openDetails ? 'rotate(180deg)' : undefined }} />
          </button>
          <dl className="lab-notes" id={detailsId} hidden={!openDetails}>
            {entry.goal && (
              <div>
                <dt>Goal</dt>
                <dd>{entry.goal}</dd>
              </div>
            )}
            {!!entry.tried?.length && (
              <div>
                <dt>What I tried</dt>
                <dd>
                  <ul>
                    {entry.tried.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            )}
            {!!entry.discovered?.length && (
              <div>
                <dt>What I discovered</dt>
                <dd>
                  <ul>
                    {entry.discovered.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            )}
            {entry.built && (
              <div>
                <dt>What I built</dt>
                <dd>{entry.built}</dd>
              </div>
            )}
          </dl>
        </>
      )}

      <footer className="lab-foot">
        <span className="mono">
          Since {formatDate(entry.started)} · updated {formatDate(entry.updated)}
        </span>
        {project && (
          <button type="button" className="text-link" onClick={() => open(project.slug)}>
            Related project
            <ArrowUpRight size={14} aria-hidden="true" />
          </button>
        )}
        {entry.links?.map((l) => (
          <a key={l.href} href={l.href} className="text-link" target="_blank" rel="noopener noreferrer">
            {l.label}
            <ArrowUpRight size={14} aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        ))}
      </footer>
    </article>
  );
}

export function Lab() {
  // Oldest entry gets LOG-001, so indices stay stable as new entries are added.
  const byAge = [...labEntries].sort((a, b) => a.started.localeCompare(b.started));
  return (
    <section id="lab" className="section" aria-labelledby="lab-title">
      <div className="container">
        <SectionHead
          id="lab-title"
          eyebrow="Learning Lab"
          title="What I am learning right now"
          lead="A working log of technologies I am exploring — honest about what is still in progress. Entries move from exploring to building to done."
        />
        <ul className="lab-grid" role="list">
          {labEntries.map((e, i) => (
            <Reveal as="li" key={e.slug} delay={(i % 3) * 0.06}>
              <LabCard entry={e} index={byAge.indexOf(e) + 1} />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
