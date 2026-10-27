import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion, useTransform, type MotionValue } from 'motion/react';
import { ease } from '../lib/motion';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import { capabilities, projectBySlug } from '../content';
import type { Evidence } from '../content/schema';
import { Reveal, SectionHead } from '../components/ui/Reveal';
import { Icon } from '../components/ui/Icon';
import { Badge, TagList } from '../components/ui/Badge';
import { Glass } from '../components/ui/Glass';
import { DimmingDemo } from '../components/capabilities/DimmingDemo';
import { evidenceColor, evidenceLabel } from '../lib/status';
import { useProjectRoute } from '../hooks/useProjectRoute';
import { useMedia } from '../hooks/useMedia';
import { useScrollSteps } from '../hooks/useScrollSteps';
import './capabilities.css';

const LEGEND: Evidence[] = ['professional', 'academic', 'exploring'];

function Legend() {
  return (
    <div className="cap-legend">
      {LEGEND.map((e) => (
        <Badge key={e} color={evidenceColor[e]}>
          {evidenceLabel[e]}
        </Badge>
      ))}
    </div>
  );
}

type Cap = (typeof capabilities)[number];
const N = capabilities.length;
/** Extra scroll the pinned section takes, in vh: enough for each area to be read */
const HEIGHT = N * 42;

export function Capabilities() {
  const narrow = useMedia('(max-width: 960px)');
  const roomy = useMedia('(min-height: 640px)');
  const still = useReducedMotion();
  const pinned = !narrow && roomy && !still;

  const head = (
    <SectionHead
      id="build-title"
      eyebrow="What I build"
      title="From a microcontroller pin to the interface people use"
      lead={
        pinned
          ? 'Most of my work lives inside devices. Scroll through the areas, or pick one, to see what it involves and where I have used it.'
          : 'Most of my work lives inside devices. Pick an area to see what it involves and where I have used it.'
      }
    />
  );

  return (
    <section
      id="build"
      className={`section${pinned ? ' section--pinned' : ''}`}
      // Pinned, it is several screens tall; say so before it first renders (content-visibility) so jumps land right
      style={pinned ? { containIntrinsicSize: `auto calc(100vh + ${HEIGHT}vh)` } : undefined}
      aria-labelledby="build-title"
    >
      {narrow ? (
        <div className="container">
          {head}
          <Legend />
          <Accordion />
        </div>
      ) : pinned ? (
        <Pinned head={head} />
      ) : (
        <div className="container">
          {head}
          <Clicked />
        </div>
      )}
    </section>
  );
}

/** Reduced motion or a short window: plain tabs. */
function Clicked() {
  const [index, setIndex] = useState(0);
  return <Tabs index={index} select={setIndex} />;
}

/** Wide screens: the section pins and scrolling walks through the areas, each opening beside the list. */
function Pinned({ head }: { head: ReactNode }) {
  const { outer, step, goTo, progress } = useScrollSteps(N);
  const fill = useTransform(progress, [0, 1], [1 / N, 1]);
  return (
    <div ref={outer} style={{ height: `calc(100vh + ${HEIGHT}vh)` }}>
      {/* Pinned content stays put while the page scrolls, so the page-long signal trace doesn't tap into it */}
      <div className="pin-stage" data-signal-skip="">
        <div className="container">
          {head}
          <Tabs index={step} select={goTo} fill={fill} />
        </div>
      </div>
    </div>
  );
}

function Tabs({ index, select, fill }: { index: number; select: (i: number) => void; fill?: MotionValue<number> }) {
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const active = capabilities[index];

  // Roving focus for the tab list (arrow keys, Home, End)
  const onKey = (e: KeyboardEvent, i: number) => {
    const next =
      e.key === 'ArrowDown' || e.key === 'ArrowRight'
        ? (i + 1) % N
        : e.key === 'ArrowUp' || e.key === 'ArrowLeft'
          ? (i - 1 + N) % N
          : e.key === 'Home'
            ? 0
            : e.key === 'End'
              ? N - 1
              : -1;
    if (next < 0) return;
    e.preventDefault();
    select(next);
    tabs.current[next]?.focus({ preventScroll: true });
  };

  return (
    <div className="cap-grid">
      <Reveal>
        <div className="cap-tabs" role="tablist" aria-label="Engineering areas" aria-orientation="vertical">
          {fill && (
            <span className="cap-rail" aria-hidden="true">
              <motion.span style={{ scaleY: fill }} />
            </span>
          )}
          {capabilities.map((c, i) => {
            const selected = i === index;
            return (
              <button
                key={c.id}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`cap-tab-${c.id}`}
                aria-selected={selected}
                aria-controls="cap-panel"
                tabIndex={selected ? 0 : -1}
                className="cap-tab"
                data-past={i < index || undefined}
                onClick={() => select(i)}
                onKeyDown={(e) => onKey(e, i)}
              >
                {selected && (
                  <motion.span
                    layoutId="cap-active"
                    className="cap-tab-bg"
                    transition={{ type: 'spring', stiffness: 400, damping: 36 }}
                  />
                )}
                <span className="cap-tab-icon">
                  <Icon name={c.icon} size={18} />
                </span>
                <span className="cap-tab-text">
                  <span className="cap-tab-title">{c.title}</span>
                  <span className="cap-tab-sum">{c.summary}</span>
                </span>
                <span className="cap-tab-dots" aria-hidden="true">
                  {c.evidence.map((ev) => (
                    <span key={ev} style={{ background: evidenceColor[ev] }} />
                  ))}
                </span>
              </button>
            );
          })}
        </div>
      </Reveal>

      <Reveal delay={0.08} className="cap-panel-wrap">
        <div className="cap-panel-top">
          <Legend />
          <span className="cap-count mono" aria-hidden="true">
            {String(index + 1).padStart(2, '0')} / {String(N).padStart(2, '0')}
          </span>
        </div>
        <Glass id="cap-panel" role="tabpanel" aria-labelledby={`cap-tab-${active.id}`} className="cap-panel">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: ease.out }}
            >
              <Detail c={active} />
            </motion.div>
          </AnimatePresence>
        </Glass>
      </Reveal>
    </div>
  );
}

function Detail({ c }: { c: Cap }) {
  const { open } = useProjectRoute();
  return (
    <div className="cap-body" data-demo={c.demo || undefined}>
      <div className="cap-info">
        <div className="cap-panel-head">
          <span className="cap-panel-icon">
            <Icon name={c.icon} size={24} />
          </span>
          <div className="cap-panel-badges">
            {c.evidence.map((ev) => (
              <Badge key={ev} color={evidenceColor[ev]}>
                {evidenceLabel[ev]}
              </Badge>
            ))}
          </div>
        </div>
        <h3 className="h3">{c.title}</h3>
        <p className="cap-detail">{c.detail}</p>
        <TagList items={c.technologies} label="Technologies" />

        {!!c.relatedProjects?.length && (
          <div className="cap-related">
            <span className="cap-related-label mono">Related work</span>
            <ul role="list">
              {c.relatedProjects.map((slug) => {
                const p = projectBySlug(slug);
                return p ? (
                  <li key={slug}>
                    <button type="button" className="text-link" onClick={() => open(slug)}>
                      {p.title}
                      <ArrowUpRight size={16} aria-hidden="true" />
                    </button>
                  </li>
                ) : null;
              })}
            </ul>
          </div>
        )}
      </div>

      {/* Beside the text when the panel is wide enough, so the whole area fits on one screen */}
      {c.demo === 'dimming' && <DimmingDemo />}
    </div>
  );
}

/** Phones and tablets: an accordion, so the details open right under the area you tapped. */
function Accordion() {
  const [openId, setOpenId] = useState<string | null>(capabilities[0]?.id ?? null);
  const rows = useRef<(HTMLLIElement | null)[]>([]);
  const toggle = (id: string, i: number) => {
    setOpenId((cur) => (cur === id ? null : id));
    // Keep the tapped row in place once the previously open one collapses above it
    requestAnimationFrame(() => rows.current[i]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
  };
  return (
    <ul className="cap-acc" role="list">
      {capabilities.map((c, i) => {
        const expanded = openId === c.id;
        return (
          <li
            key={c.id}
            ref={(el) => {
              rows.current[i] = el;
            }}
            className="cap-acc-item"
            data-open={expanded || undefined}
          >
            <h3 className="cap-acc-h">
              <button
                type="button"
                className="cap-tab"
                aria-expanded={expanded}
                aria-controls={`cap-acc-${c.id}`}
                id={`cap-acc-btn-${c.id}`}
                onClick={() => toggle(c.id, i)}
              >
                <span className="cap-tab-icon">
                  <Icon name={c.icon} size={18} />
                </span>
                <span className="cap-tab-text">
                  <span className="cap-tab-title">{c.title}</span>
                </span>
                <span className="cap-tab-dots" aria-hidden="true">
                  {c.evidence.map((ev) => (
                    <span key={ev} style={{ background: evidenceColor[ev] }} />
                  ))}
                </span>
                <ChevronDown className="cap-acc-chev" size={18} aria-hidden="true" />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  key="body"
                  id={`cap-acc-${c.id}`}
                  role="region"
                  aria-labelledby={`cap-acc-btn-${c.id}`}
                  className="cap-acc-body"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: ease.out }}
                >
                  <div className="cap-acc-inner">
                    <Detail c={c} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
