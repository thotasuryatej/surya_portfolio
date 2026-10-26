import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { journey, journeyPhases, milestoneDate, projectBySlug } from '../content';
import { SectionHead } from '../components/ui/Reveal';
import { Icon } from '../components/ui/Icon';
import { useProjectRoute } from '../hooks/useProjectRoute';
import './journey.css';
import { asset } from '../lib/asset';

const count = (phase: string) => journey.filter((m) => m.phase === phase).length;

/**
 * Journey: one board, one screen. A trace runs across the top through each phase (B.Tech →
 * internship → PAT IoT) and every stop sits under its phase. On phones the phases become
 * buttons and the chosen phase's stops appear directly underneath.
 */
export function Journey() {
  const [phase, setPhase] = useState(journeyPhases[journeyPhases.length - 1].id);

  return (
    <section id="journey" className="section jr" aria-labelledby="journey-title">
      <div className="container">
        <SectionHead
          id="journey-title"
          eyebrow="Journey"
          title="From a first circuit to shipping firmware"
          lead="B.Tech from 2021 to 2025, an internship, then full-time firmware. Stops with an arrow open a case study."
        />

        <div className="jr-switch" role="group" aria-label="Show a phase">
          {journeyPhases.map((p) => (
            <button key={p.id} type="button" aria-pressed={phase === p.id} onClick={() => setPhase(p.id)}>
              <strong>{p.label}</strong>
              <span className="mono">{p.range}</span>
            </button>
          ))}
        </div>

        <div className="jr-board" style={{ ['--cols' as string]: journeyPhases.map((p) => `${Math.min(2, count(p.id))}fr`).join(' ') }}>
          <span className="jr-trace" aria-hidden="true">
            <motion.span
              className="jr-current"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            />
          </span>
          {journeyPhases.map((p) => (
            <div key={p.id} className="jr-col" data-active={phase === p.id || undefined}>
              <h3 className="jr-col-head">
                <span className="jr-pad" aria-hidden="true" />
                <strong>{p.label}</strong>
                <span className="mono">{p.range}</span>
              </h3>
              <ol className="jr-items" role="list" data-wide={count(p.id) > 1 || undefined}>
                {journey
                  .filter((m) => m.phase === p.id)
                  .map((m) => (
                    <li key={m.title}>
                      <Stop m={m} />
                    </li>
                  ))}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stop({ m }: { m: (typeof journey)[number] }) {
  const { open } = useProjectRoute();
  const p = m.project ? projectBySlug(m.project) : undefined;
  const body = (
    <>
      {m.logo ? (
        <img className="jr-logo" src={asset(m.logo.src)} alt={m.logo.alt} width={36} height={36} loading="lazy" />
      ) : (
        <span className="jr-icon" aria-hidden="true">
          <Icon name={m.icon} size={17} />
        </span>
      )}
      <span className="jr-body">
        <span className="jr-when mono">
          {milestoneDate(m)}
          {p && <ArrowUpRight className="jr-go" size={15} aria-hidden="true" />}
        </span>
        <strong className="jr-title">{m.title}</strong>
        <span className="jr-text">{m.text}</span>
      </span>
    </>
  );
  return p ? (
    <button type="button" className="jr-btn glass glass--thin" data-kind={m.kind} onClick={() => open(p.slug)} aria-label={`${milestoneDate(m)}: ${m.title}. Open case study`}>
      {body}
    </button>
  ) : (
    <div className="jr-btn glass glass--thin" data-kind={m.kind}>
      {body}
    </div>
  );
}
