import { useEffect, useLayoutEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Award, CheckCircle2, CircleDashed, Info, X } from 'lucide-react';
import { projects, projectBySlug } from '../../content';
import { Badge, TagList } from '../ui/Badge';
import { ProjectMedia } from './ProjectCard';
import { Diagram } from '../diagrams/Diagram';
import { formatDate, formatPeriod } from '../../lib/format';
import { projectStatusColor } from '../../lib/status';
import { useProjectRoute } from '../../hooks/useProjectRoute';

/** Case-study view in a native modal <dialog>: focus trapping, Escape and inert background come from the browser. */
export function ProjectDialog() {
  const { openSlug, open, close } = useProjectRoute();
  const ref = useRef<HTMLDialogElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const project = openSlug ? projectBySlug(openSlug) : undefined;

  // Layout effect: the dialog must be open before a View Transition captures the new state.
  useLayoutEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (project && !d.open) {
      d.showModal();
      document.documentElement.classList.add('dialog-open');
    } else if (!project && d.open) {
      d.close();
    }
    if (!project) document.documentElement.classList.remove('dialog-open');
  }, [project]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
    ref.current?.querySelector<HTMLElement>('.dlg-title')?.focus({ preventScroll: true });
  }, [openSlug]);

  // An unknown slug in the URL (e.g. a renamed project) should not leave a broken state.
  useEffect(() => {
    if (openSlug && !project) close();
  }, [openSlug, project, close]);

  const idx = project ? projects.indexOf(project) : -1;
  const prev = idx > 0 ? projects[idx - 1] : undefined;
  const next = idx >= 0 && idx < projects.length - 1 ? projects[idx + 1] : undefined;

  return (
    <dialog
      ref={ref}
      className="dlg"
      aria-labelledby="dlg-title"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) close(); // backdrop
      }}
    >
      {project && (
        <div className="dlg-panel glass glass--strong">
          <header className="dlg-bar">
            <span className="mono dlg-crumb">
              Projects / {String(idx + 1).padStart(2, '0')}
            </span>
            <button type="button" className="icon-btn" onClick={close} aria-label="Close case study">
              <X size={20} aria-hidden="true" />
            </button>
          </header>

          <div className="dlg-scroll" ref={scroller}>
            <div className="dlg-hero">
              <div className="dlg-media">
                <ProjectMedia project={project} />
              </div>
              <div className="dlg-intro">
                <div className="pc-meta">
                  <Badge color={projectStatusColor[project.status]} live={project.status === 'In progress'}>
                    {project.status}
                  </Badge>
                  <span className="pc-cat mono">
                    {project.category} · {formatPeriod(project.period)}
                  </span>
                </div>
                <h2 id="dlg-title" className="dlg-title" tabIndex={-1}>
                  {project.title}
                </h2>
                <p className="dlg-sum">{project.summary}</p>
                {project.recognition && (
                  <p className="pc-rec">
                    <Award size={15} aria-hidden="true" />
                    {project.recognition}
                  </p>
                )}
              </div>
            </div>

            <div className="dlg-grid">
              <div className="dlg-main">
                <section>
                  <h3 className="dlg-h">Overview</h3>
                  {project.overview.map((p) => (
                    <p key={p.slice(0, 30)} className="dlg-p">
                      {p}
                    </p>
                  ))}
                </section>

                {project.progress && (
                  <section className="dlg-progress">
                    <div>
                      <h3 className="dlg-h">Done</h3>
                      <ul role="list" className="dlg-checks">
                        {project.progress.done.map((x) => (
                          <li key={x}>
                            <CheckCircle2 size={17} aria-hidden="true" className="ok" />
                            {x}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {!!project.progress.ongoing?.length && (
                      <div>
                        <h3 className="dlg-h">In progress</h3>
                        <ul role="list" className="dlg-checks">
                          {project.progress.ongoing.map((x) => (
                            <li key={x}>
                              <CircleDashed size={17} aria-hidden="true" className="wip" />
                              {x}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </section>
                )}

                {project.diagram && <Diagram name={project.diagram} />}

                {!!project.highlights?.length && (
                  <section>
                    <h3 className="dlg-h">What I did</h3>
                    <ul className="dlg-list">
                      {project.highlights.map((h) => (
                        <li key={h}>{h}</li>
                      ))}
                    </ul>
                  </section>
                )}

                {project.sections?.map((s) => (
                  <section key={s.heading}>
                    <h3 className="dlg-h">{s.heading}</h3>
                    {s.body.map((p) => (
                      <p key={p.slice(0, 30)} className="dlg-p">
                        {p}
                      </p>
                    ))}
                    {s.bullets && (
                      <ul className="dlg-list">
                        {s.bullets.map((b) => (
                          <li key={b}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </section>
                ))}

                {!!project.media?.length && (
                  <section>
                    <h3 className="dlg-h">Gallery</h3>
                    <div className="dlg-gallery">
                      {project.media.map((m) => (
                        <figure key={m.src}>
                          {m.type === 'video' ? (
                            <video src={m.src} poster={m.poster} controls preload="none" aria-label={m.alt} />
                          ) : (
                            <img src={m.src} alt={m.alt} loading="lazy" decoding="async" />
                          )}
                          {m.caption && <figcaption>{m.caption}</figcaption>}
                        </figure>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              <aside className="dlg-side" aria-label="Project details">
                <dl className="dlg-facts">
                  {project.role && (
                    <div>
                      <dt>Role</dt>
                      <dd>{project.role}</dd>
                    </div>
                  )}
                  <div>
                    <dt>When</dt>
                    <dd>{formatPeriod(project.period)}</dd>
                  </div>
                  <div>
                    <dt>Technologies</dt>
                    <dd>
                      <TagList items={project.technologies} />
                    </dd>
                  </div>
                  {project.updated && (
                    <div>
                      <dt>Last updated</dt>
                      <dd>{formatDate(project.updated)}</dd>
                    </div>
                  )}
                </dl>
                {!!project.links?.length && (
                  <ul role="list" className="dlg-links">
                    {project.links.map((l) => (
                      <li key={l.href}>
                        <a className="btn btn--glass glass glass--thin btn--sm" href={l.href} target="_blank" rel="noopener noreferrer">
                          {l.label}
                          <ArrowUpRight size={16} aria-hidden="true" />
                          <span className="sr-only">(opens in a new tab)</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
                {project.note && (
                  <p className="dlg-note">
                    <Info size={16} aria-hidden="true" />
                    {project.note}
                  </p>
                )}
              </aside>
            </div>

            <nav className="dlg-pager" aria-label="More projects">
              {prev ? (
                <button type="button" className="dlg-page" onClick={() => open(prev.slug)}>
                  <ArrowLeft size={16} aria-hidden="true" />
                  <span>
                    <span className="mono">Previous</span>
                    {prev.title}
                  </span>
                </button>
              ) : (
                <span />
              )}
              {next && (
                <button type="button" className="dlg-page dlg-page--next" onClick={() => open(next.slug)}>
                  <span>
                    <span className="mono">Next</span>
                    {next.title}
                  </span>
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
              )}
            </nav>
          </div>
        </div>
      )}
    </dialog>
  );
}
