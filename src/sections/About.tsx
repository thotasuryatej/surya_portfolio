import { Fragment, useId, useState, type CSSProperties } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ease } from '../lib/motion';
import { ChevronDown } from 'lucide-react';
import { about, jobs, profile } from '../content';
import { Reveal, SectionHead } from '../components/ui/Reveal';
import { Icon } from '../components/ui/Icon';
import { PortraitBoot } from '../components/about/PortraitBoot';
import './about.css';

export function About() {
  const [more, setMore] = useState(false);
  const moreId = useId();
  const current = jobs.find((j) => j.period.end === 'present') ?? jobs[0];
  const role = current?.role ?? profile.roles[0];
  const [lead, ...rest] = about.intro;

  return (
    <section id="about" className="section" aria-labelledby="about-title">
      <div className="container">
        <SectionHead id="about-title" eyebrow="About" title={about.title} />

        <div className="about-grid">
          <div className="about-portrait">
            <PortraitBoot role={role} />
          </div>

          <div className="about-text">
            <Reveal>
              <p className="about-lead">{lead}</p>
            </Reveal>

            <ul className="glance" role="list" aria-label="At a glance">
              {about.glance.map((g, i) => (
                <Reveal as="li" key={g.label} delay={(i % 3) * 0.06}>
                  <div className="glance-tile">
                    <span className="glance-icon" aria-hidden="true">
                      <Icon name={g.icon} size={18} />
                    </span>
                    <span className="glance-label mono">{g.label}</span>
                    <span className="glance-items">
                      {g.items.map((it) => (
                        <span key={it} className="glance-chip">
                          {it}
                        </span>
                      ))}
                    </span>
                  </div>
                </Reveal>
              ))}
            </ul>

            <AnimatePresence initial={false}>
              {more && (
                <motion.div
                  id={moreId}
                  key="more"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.45, ease: ease.out }}
                  style={{ overflow: 'hidden' }}
                >
                  {[...rest, ...about.more].map((p) => (
                    <p key={p.slice(0, 24)} className="about-p">
                      {p}
                    </p>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <button type="button" className="about-more" aria-expanded={more} aria-controls={moreId} onClick={() => setMore((m) => !m)}>
              {more ? 'Show less' : 'Read the longer version'}
              <ChevronDown size={16} aria-hidden="true" style={{ transform: more ? 'rotate(180deg)' : undefined }} />
            </button>
          </div>
        </div>

        {/* Each word lights up in turn as the line scrolls through the screen (CSS scroll timeline, about.css) */}
        {about.statement && (
          <p className="about-statement" data-signal-tap>
            {about.statement.split(' ').map((w, i) => (
              <Fragment key={i}>
                <span className="st-word" style={{ '--i': i } as CSSProperties}>
                  {w}
                </span>{' '}
              </Fragment>
            ))}
          </p>
        )}
      </div>
    </section>
  );
}
