import { useEffect, useReducer, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, StepForward } from 'lucide-react';
import { useInView, usePrefersReducedMotion } from '../../hooks/useInView';

/**
 * A toy model — not simulation data. Each tick the link sends one packet.
 * A bulk flow offers one packet per tick; an IoT sensor offers one every third tick,
 * so the link is overloaded and a queue builds.
 *  - FIFO: one shared drop-tail queue.
 *  - FQ-CoDel: one queue per flow served in turn; bulk packets that waited too long are dropped.
 */
type Flow = 'bulk' | 'iot';
interface Pkt {
  id: number;
  flow: Flow;
  t: number;
}
interface Sched {
  queues: Record<Flow, Pkt[]>;
  next: Flow;
  iotDelays: number[];
  drops: number;
}
interface State {
  tick: number;
  seq: number;
  fifo: Pkt[];
  fifoDelays: number[];
  fifoDrops: number;
  fq: Sched;
}

const FIFO_CAP = 12;
const CODEL_TARGET = 4; // ticks

const initial = (): State => ({
  tick: 0,
  seq: 0,
  fifo: [],
  fifoDelays: [],
  fifoDrops: 0,
  fq: { queues: { bulk: [], iot: [] }, next: 'bulk', iotDelays: [], drops: 0 },
});

function step(s: State): State {
  const tick = s.tick + 1;
  let seq = s.seq;
  const arrivals: Pkt[] = [{ id: ++seq, flow: 'bulk', t: tick }];
  if (tick % 3 === 0) arrivals.push({ id: ++seq, flow: 'iot', t: tick });

  // FIFO
  const fifo = [...s.fifo];
  let fifoDrops = s.fifoDrops;
  for (const p of arrivals) {
    if (fifo.length < FIFO_CAP) fifo.push(p);
    else fifoDrops++;
  }
  const fifoDelays = [...s.fifoDelays];
  const sent = fifo.shift();
  if (sent?.flow === 'iot') fifoDelays.push(tick - sent.t);

  // FQ-CoDel
  const q = { bulk: [...s.fq.queues.bulk], iot: [...s.fq.queues.iot] };
  for (const p of arrivals) q[p.flow].push(p);
  let drops = s.fq.drops;
  const iotDelays = [...s.fq.iotDelays];
  let next = s.fq.next;
  const order: Flow[] = next === 'bulk' ? ['bulk', 'iot'] : ['iot', 'bulk'];
  for (const f of order) {
    // CoDel: drop packets at the head that have waited longer than the target
    while (q[f].length && tick - q[f][0].t > CODEL_TARGET) {
      q[f].shift();
      drops++;
    }
    const p = q[f].shift();
    if (p) {
      if (p.flow === 'iot') iotDelays.push(tick - p.t);
      next = f === 'bulk' ? 'iot' : 'bulk';
      break;
    }
  }

  return { tick, seq, fifo, fifoDelays, fifoDrops, fq: { queues: q, next, iotDelays, drops } };
}

const avg = (xs: number[]) => (xs.length ? (xs.reduce((a, b) => a + b, 0) / xs.length).toFixed(1) : '—');

type Action = 'step' | 'reset';
const reducer = (s: State, a: Action) => (a === 'reset' ? warm() : step(s));
const warm = () => Array.from({ length: 9 }).reduce<State>((s) => step(s), initial());

function Lane({ label, pkts, cap }: { label: string; pkts: Pkt[]; cap: number }) {
  return (
    <div className="fq-lane">
      <span className="fq-lane-label mono">{label}</span>
      <div className="fq-queue" style={{ ['--cap' as string]: cap }}>
        {pkts.map((p) => (
          <span key={p.id} className={`fq-pkt fq-pkt--${p.flow}`} />
        ))}
      </div>
      <span className="fq-link" aria-hidden="true" />
    </div>
  );
}

export function FqCodelSim() {
  const [s, dispatch] = useReducer(reducer, undefined, warm);
  const reduced = usePrefersReducedMotion();
  const [playing, setPlaying] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, '0px');

  useEffect(() => {
    if (!playing || !inView) return;
    const id = window.setInterval(() => dispatch('step'), reduced ? 1200 : 650);
    return () => window.clearInterval(id);
  }, [playing, inView, reduced]);

  return (
    <div className="dg fq" ref={ref}>
      <div className="fq-controls">
        <button type="button" className="btn btn--glass glass glass--thin btn--sm" onClick={() => setPlaying((p) => !p)} aria-pressed={playing}>
          {playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
          {playing ? 'Pause' : 'Play'}
        </button>
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => dispatch('step')}>
          <StepForward size={16} aria-hidden="true" /> Step
        </button>
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => dispatch('reset')}>
          <RotateCcw size={16} aria-hidden="true" /> Reset
        </button>
        <span className="fq-tick mono">t = {s.tick}</span>
      </div>

      <div className="fq-cols">
        <div className="fq-col">
          <h4 className="fq-title">Single FIFO queue</h4>
          <Lane label="all" pkts={s.fifo} cap={FIFO_CAP} />
          <dl className="fq-stats">
            <div>
              <dt>IoT packet wait (avg)</dt>
              <dd className="mono">{avg(s.fifoDelays)} ticks</dd>
            </div>
            <div>
              <dt>Dropped</dt>
              <dd className="mono">{s.fifoDrops}</dd>
            </div>
          </dl>
        </div>
        <div className="fq-col">
          <h4 className="fq-title">FQ-CoDel</h4>
          <Lane label="bulk" pkts={s.fq.queues.bulk} cap={FIFO_CAP} />
          <Lane label="iot" pkts={s.fq.queues.iot} cap={FIFO_CAP} />
          <dl className="fq-stats">
            <div>
              <dt>IoT packet wait (avg)</dt>
              <dd className="mono">{avg(s.fq.iotDelays)} ticks</dd>
            </div>
            <div>
              <dt>Dropped (bulk, waited too long)</dt>
              <dd className="mono">{s.fq.drops}</dd>
            </div>
          </dl>
        </div>
      </div>

      <p className="fq-legend">
        <span className="fq-pkt fq-pkt--bulk" aria-hidden="true" /> bulk download
        <span className="fq-pkt fq-pkt--iot" aria-hidden="true" /> IoT sensor message
      </p>
      <p className="dg-note">
        Toy model for intuition only: one packet sent per tick, the link deliberately overloaded. It is not output from the NS-3
        simulation.
      </p>
    </div>
  );
}
