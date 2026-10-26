import { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

type Link = 'boot' | 'down' | 'up' | 'fail' | 'ok' | 'power';
type Slot = 'N' | 'C' | 'L';

interface Step {
  /** Line printed by the simulator at this step. Steps without one are derived from the code, not the log. */
  log?: string;
  title: string;
  text: string;
  link: Link;
  occ: number;
  appended: number;
  dropped: number;
  acked: number;
  backoff?: number;
  slots?: Slot[];
  config?: { sampling: number; upload: number; batch: number; changed?: 'upload' | 'rejected' };
}

interface Scenario {
  id: string;
  label: string;
  cap: number;
  steps: Step[];
}

const fill = (s: Slot, n: number): Slot[] => Array.from({ length: n }, () => s);

// Every `log` line is copied from a real run of sim/simulator.cpp (iot_agent_sim). Do not edit them by hand.
const SCENARIOS: Scenario[] = [
  {
    id: 'outage',
    label: 'Outage & retry',
    cap: 100000,
    steps: [
      { log: '[t=000] DEVICE_BOOT', title: 'Boot', text: 'The agent restores its checkpoint from flash. Nothing is waiting to be uploaded.', link: 'boot', occ: 0, appended: 0, dropped: 0, acked: 0 },
      { log: '[t=001] NETWORK_DISCONNECTED', title: 'Link drops', text: 'The network goes away. Sampling carries on regardless.', link: 'down', occ: 0, appended: 0, dropped: 0, acked: 0 },
      { log: '[t=002] 100 SENSOR_READINGS appended', title: 'Sensor burst', text: 'A burst of 100 readings goes straight into the flash ring buffer, so the outage costs nothing.', link: 'down', occ: 100, appended: 100, dropped: 0, acked: 0 },
      { log: '[t=003] NETWORK_CONNECTED', title: 'Link returns', text: 'The scheduler builds a batch of everything pending.', link: 'up', occ: 100, appended: 100, dropped: 0, acked: 0 },
      { log: '[t=003] UPLOAD_FAILED batch=#1 attempt=1', title: 'Upload fails', text: 'The batch stays in flash. The retry waits 2 s instead of hammering a struggling link.', link: 'fail', occ: 100, appended: 100, dropped: 0, acked: 0, backoff: 2 },
      { log: '[t=005] UPLOAD_FAILED batch=#1 attempt=2', title: 'Fails again', text: 'Exponential backoff doubles the wait to 4 s (capped at 60 s).', link: 'fail', occ: 100, appended: 100, dropped: 0, acked: 0, backoff: 4 },
      { log: '[t=009] UPLOAD_SUCCESS batch=#1 size=100 -> acknowledge_batch()', title: 'Delivered', text: 'Only a confirmed send removes data. Every record carries a seq_id, so the cloud can drop duplicates from a retried batch.', link: 'ok', occ: 100, appended: 100, dropped: 0, acked: 0 },
      { log: '[t=073]   buffer after upload: occupied=0/100000 appended=100 dropped=0 acked=100', title: 'Buffer clear', text: 'All 100 readings acknowledged; none lost, none dropped.', link: 'ok', occ: 0, appended: 100, dropped: 0, acked: 100 },
    ],
  },
  {
    id: 'power',
    label: 'Power loss',
    cap: 100000,
    steps: [
      { log: '[t=075] DEVICE_BOOT (first power-on)', title: 'Power on', text: 'A fresh device with an empty buffer.', link: 'boot', occ: 0, appended: 0, dropped: 0, acked: 0 },
      { log: '[t=075] 40 SENSOR_READINGS appended, then power lost before any upload', title: 'Power cut', text: 'The agent is destroyed mid-flight with no graceful shutdown, as a real power cut would.', link: 'power', occ: 40, appended: 40, dropped: 0, acked: 0 },
      { log: '[t=076] DEVICE_BOOT (recovered from simulated power loss)', title: 'Reboot', text: 'A new agent reads the same flash files. The A/B checkpoint (CRC + version) and a forward scan rebuild the buffer state.', link: 'boot', occ: 40, appended: 40, dropped: 0, acked: 0 },
      { log: '[t=076]   -> all 40 unacknowledged readings recovered from flash, none lost', title: 'Recovered', text: 'All 40 unacknowledged readings are back and will upload on the next connection.', link: 'boot', occ: 40, appended: 40, dropped: 0, acked: 0 },
    ],
  },
  {
    id: 'full',
    label: 'Flash full',
    cap: 10,
    steps: [
      { log: '[t=078] DEVICE_BOOT (capacity=10 records, network stays disconnected)', title: 'Tiny buffer', text: 'A 10-record buffer, so the limit is reached quickly. The network stays down.', link: 'down', occ: 0, appended: 0, dropped: 0, acked: 0, slots: [] },
      { log: '[t=078] 5 NORMAL readings + 1 CRITICAL vibration-alarm reading appended', title: 'A critical reading', text: 'Five normal readings, then one CRITICAL vibration alarm.', link: 'down', occ: 6, appended: 6, dropped: 0, acked: 0, slots: [...fill('N', 5), 'C'] },
      { title: 'Flood begins', text: '20 low-priority readings arrive. The first 4 take the free slots.', link: 'down', occ: 10, appended: 10, dropped: 0, acked: 0, slots: [...fill('N', 5), 'C', ...fill('L', 4)] },
      { title: 'Oldest evicted', text: 'The buffer is full, so each new reading evicts the oldest one — the 5 normal readings go first, in order.', link: 'down', occ: 10, appended: 15, dropped: 5, acked: 0, slots: ['C', ...fill('L', 9)] },
      { log: '[t=078]   buffer: occupied=10/10 appended=15 dropped=16 acked=0', title: 'Critical protected', text: 'Now the oldest record is CRITICAL. It is never evicted by low-priority data, so the remaining 11 new readings are shed instead.', link: 'down', occ: 10, appended: 15, dropped: 16, acked: 0, slots: ['C', ...fill('L', 9)] },
      { log: '[t=078]   CRITICAL record still present in buffer: yes', title: 'Alarm kept', text: 'The vibration alarm survives the flood and will be uploaded when the link returns.', link: 'down', occ: 10, appended: 15, dropped: 16, acked: 0, slots: ['C', ...fill('L', 9)] },
    ],
  },
  {
    id: 'config',
    label: 'Remote config',
    cap: 1000,
    steps: [
      { log: '[t=080] initial config: sampling=5s upload=60s max_batch=100', title: 'Current config', text: 'The device config is stored with the same A/B, CRC-checked pattern as the buffer.', link: 'up', occ: 0, appended: 0, dropped: 0, acked: 0, config: { sampling: 5, upload: 60, batch: 100 } },
      { log: '[t=080] CONFIG_UPDATE_RECEIVED { upload_interval: 30s }', title: 'Partial update', text: 'Only upload_interval is sent. It is validated against fixed ranges and applied; the other fields are left alone.', link: 'up', occ: 0, appended: 0, dropped: 0, acked: 0, config: { sampling: 5, upload: 30, batch: 100, changed: 'upload' } },
      { log: '[t=080] CONFIG_UPDATE_RECEIVED { sampling_interval: 0s } (out of range)', title: 'Invalid update', text: 'A sampling interval of 0 s is out of range, so the push is rejected and logged. The previous value is kept.', link: 'up', occ: 0, appended: 0, dropped: 0, acked: 0, config: { sampling: 5, upload: 30, batch: 100, changed: 'rejected' } },
    ],
  },
];

const LINK: Record<Link, string> = {
  boot: 'Booting',
  down: 'Offline',
  up: 'Online',
  fail: 'Upload failed',
  ok: 'Uploaded',
  power: 'Power lost',
};

/** Replays the telemetry agent's simulator, one logged event at a time. */
export function TelemetryReplay() {
  const [si, setSi] = useState(0);
  const [step, setStep] = useState(0);
  const sc = SCENARIOS[si];
  const s = sc.steps[step];
  const last = sc.steps.length - 1;
  const lines = sc.steps.slice(0, step + 1).filter((x) => x.log);

  const pick = (i: number) => {
    setSi(i);
    setStep(0);
  };

  return (
    <div className="dg tr">
      <div className="seg tr-tabs" role="group" aria-label="Scenario">
        {SCENARIOS.map((x, i) => (
          <button key={x.id} type="button" aria-pressed={i === si} onClick={() => pick(i)}>
            {x.label}
          </button>
        ))}
      </div>

      <div className="tr-device">
        <div className="tr-row">
          <span className="tr-link" data-link={s.link}>
            <i aria-hidden="true" />
            {LINK[s.link]}
          </span>
          {s.backoff && <span className="tr-backoff">retry in {s.backoff} s</span>}
          <span className="tr-cap">capacity {sc.cap.toLocaleString('en-US')} records</span>
        </div>

        {s.config ? (
          <dl className="tr-config">
            <div>
              <dt>sampling</dt>
              <dd data-state={s.config.changed === 'rejected' ? 'kept' : undefined}>{s.config.sampling} s</dd>
            </div>
            <div>
              <dt>upload</dt>
              <dd data-state={s.config.changed === 'upload' ? 'changed' : undefined}>{s.config.upload} s</dd>
            </div>
            <div>
              <dt>max batch</dt>
              <dd>{s.config.batch}</dd>
            </div>
          </dl>
        ) : s.slots ? (
          <ol className="tr-slots" aria-label={`Buffer, oldest first: ${s.occ} of ${sc.cap} slots used`}>
            {Array.from({ length: sc.cap }, (_, i) => {
              const v = s.slots![i];
              return (
                <li key={i} data-slot={v}>
                  {v ?? ''}
                </li>
              );
            })}
          </ol>
        ) : (
          <div className="tr-meter" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={s.occ} aria-label="Readings waiting in flash, against one 100-reading upload batch">
            {/* scaled to one upload batch (max_batch = 100); the 100,000-record capacity would make the bar invisible */}
            <span style={{ width: `${Math.min(s.occ, 100)}%` }} />
            <em>{s.occ} readings waiting in flash</em>
          </div>
        )}

        {!s.config && (
          <dl className="tr-stats">
            <div>
              <dt>appended</dt>
              <dd>{s.appended}</dd>
            </div>
            <div>
              <dt>dropped</dt>
              <dd>{s.dropped}</dd>
            </div>
            <div>
              <dt>acked</dt>
              <dd>{s.acked}</dd>
            </div>
          </dl>
        )}
        {s.slots && (
          <p className="tr-key">
            <span data-slot="N">N</span> normal <span data-slot="C">C</span> critical <span data-slot="L">L</span> low priority
          </p>
        )}
      </div>

      <div className="dg-detail" aria-live="polite">
        <strong>
          {step + 1}/{sc.steps.length} · {s.title}
        </strong>
        <p>{s.text}</p>
        {!s.log && <p className="tr-derived">Intermediate state traced from append_reading(); the simulator logs only the totals.</p>}
      </div>

      <div className="tr-controls">
        <button type="button" className="tr-btn" onClick={() => setStep(step - 1)} disabled={step === 0} aria-label="Previous event">
          <ChevronLeft size={16} aria-hidden="true" />
        </button>
        <ol className="tr-dots" aria-label="Events">
          {sc.steps.map((x, i) => (
            <li key={i}>
              <button type="button" aria-pressed={i === step} data-done={i < step || undefined} onClick={() => setStep(i)} aria-label={`Event ${i + 1}: ${x.title}`} />
            </li>
          ))}
        </ol>
        {step < last ? (
          <button type="button" className="tr-btn tr-btn--next" onClick={() => setStep(step + 1)}>
            Next event <ChevronRight size={16} aria-hidden="true" />
          </button>
        ) : (
          <button type="button" className="tr-btn tr-btn--next" onClick={() => setStep(0)}>
            <RotateCcw size={15} aria-hidden="true" /> Replay
          </button>
        )}
      </div>

      <pre className="tr-log" aria-label="Simulator log so far">
        {lines.map((x, i) => (
          <span key={x.log} data-current={i === lines.length - 1 && !!s.log ? true : undefined}>
            {x.log}
            {'\n'}
          </span>
        ))}
      </pre>

      <p className="dg-note">The log lines are copied from a real run of the project's simulator. There is no real hardware or cloud in this project.</p>
    </div>
  );
}
