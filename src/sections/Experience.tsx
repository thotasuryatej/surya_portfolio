import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { ArrowUpRight, ChevronDown, GraduationCap, MapPin } from 'lucide-react';
import { achievements, education, jobs, projectBySlug } from '../content';
import { Reveal, SectionHead } from '../components/ui/Reveal';
import { Icon } from '../components/ui/Icon';
import { Badge, TagList } from '../components/ui/Badge';
import { formatPeriod } from '../lib/format';
import { useProjectRoute } from '../hooks/useProjectRoute';
import type { Job } from '../content/schema';
import './experience.css';
import { asset } from '../lib/asset';

const VISIBLE_POINTS = 3;

function JobItem({ job, id, labelledBy }: { job: Job; id: string; labelledBy: string }) {
  const [expanded, setExpanded] = useState(false);
  const listId = useId();
  const current = job.period.end === 'present';
  const points = expanded ? job.points : job.points.slice(0, VISIBLE_POINTS);
  const hidden = job.points.length - VISIBLE_POINTS;
  return (
    <article className="job surface" role="tabpanel" id={id} aria-labelledby={labelledBy}>
      <header className="job-head">
        {job.logo && (
          <span className="job-logo">
            <img src={asset(job.logo.src)} alt={job.logo.alt} width={56} height={56} loading="lazy" decoding="async" />
          </span>
        )}
        <div className="job-id">
          <h3 className="job-role">{job.role}</h3>
          <p className="job-co">
            {job.website ? (
              <a href={job.website} target="_blank" rel="noopener noreferrer" className="text-link">
                {job.company}
                <ArrowUpRight size={14} aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            ) : (
              job.company
            )}
            <span className="job-loc">
              <MapPin size={13} aria-hidden="true" /> {job.location}
            </span>
          </p>
        </div>
        <div className="job-when">
          {current && <Badge color="var(--green)" live>Current</Badge>}
          <span className="mono">{formatPeriod(job.period)}</span>
        </div>
      </header>
      <p className="job-sum">{job.summary}</p>
      <ul className="job-points" id={listId}>
        {points.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
      {hidden > 0 && (
        <button type="button" className="about-more job-more" aria-expanded={expanded} aria-controls={listId} onClick={() => setExpanded((x) => !x)}>
          {expanded ? 'Show less' : `Show ${hidden} more`}
          <ChevronDown size={16} aria-hidden="true" style={{ transform: expanded ? 'rotate(180deg)' : undefined }} />
        </button>
      )}
      <TagList items={job.technologies} label="Technologies" />
    </article>
  );
}

export function Experience() {
  const { open } = useProjectRoute();
  const [sel, setSel] = useState(0);
  const uid = useId();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: KeyboardEvent) => {
    const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const to = (sel + dir + jobs.length) % jobs.length;
    setSel(to);
    tabs.current[to]?.focus();
  };
  return (
    <section id="experience" className="section" aria-labelledby="experience-title">
      <div className="container">
        <SectionHead
          id="experience-title"
          eyebrow="Experience"
          title="Where I have been building"
          lead="Professional firmware work, the degree behind it, and the moments that pushed me further."
        />

        <div className="xp-grid">
          <Reveal className="xp-jobs">
            <div className="xp-tabs" role="tablist" aria-label="Jobs" onKeyDown={onKey}>
              {jobs.map((j, i) => (
                <button
                  key={j.company + j.period.start}
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`${uid}-tab-${i}`}
                  className="xp-tab"
                  aria-selected={sel === i}
                  aria-controls={`${uid}-panel`}
                  tabIndex={sel === i ? 0 : -1}
                  onClick={() => setSel(i)}
                >
                  {j.logo && <img src={asset(j.logo.src)} alt="" width={32} height={32} loading="lazy" decoding="async" />}
                  <span>
                    <strong>{j.company}</strong>
                    <span className="mono">{formatPeriod(j.period)}</span>
                  </span>
                  {j.period.end === 'present' && <span className="badge-dot is-live" aria-hidden="true" />}
                </button>
              ))}
            </div>
            <JobItem key={sel} job={jobs[sel]} id={`${uid}-panel`} labelledBy={`${uid}-tab-${sel}`} />
          </Reveal>

          <div className="xp-side">
            <Reveal>
              <h3 className="xp-sub">Education</h3>
              {education.map((e) => (
                <article key={e.institution} className="edu surface">
                  <span className="edu-icon">
                    <GraduationCap size={20} aria-hidden="true" />
                  </span>
                  <div>
                    <h4 className="edu-degree">{e.degree}</h4>
                    <p className="edu-inst">{e.institution}</p>
                    <p className="edu-meta mono">
                      {formatPeriod(e.period)} · {e.location}
                      {e.grade && ` · ${e.grade}`}
                    </p>
                  </div>
                </article>
              ))}
            </Reveal>

            <Reveal delay={0.06}>
              <h3 className="xp-sub">Recognition & programmes</h3>
              <ul className="ach" role="list">
                {achievements.map((a) => {
                  const p = a.relatedProject ? projectBySlug(a.relatedProject) : undefined;
                  return (
                    <li key={a.title} className={`ach-item ach-item--${a.kind}`}>
                      <span className="ach-icon">
                        <Icon name={a.icon} size={18} />
                      </span>
                      <div>
                        <p className="ach-title">{a.title}</p>
                        <p className="ach-ctx">
                          {a.context}
                          {p && (
                            <>
                              {' '}
                              <button type="button" className="text-link" onClick={() => open(p.slug)}>
                                View project
                                <ArrowUpRight size={14} aria-hidden="true" />
                              </button>
                            </>
                          )}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
