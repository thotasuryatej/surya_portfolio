import { useId, useMemo, useState, type CSSProperties } from 'react';

/**
 * Interactive explainer for the four dimming techniques I work with.
 * Waveforms are generated from the slider value — illustrative, not measured.
 */
type Mode = 'phase' | 'pwm' | 'dali' | 'analog';

const MODES: { id: Mode; label: string; caption: string }[] = [
  {
    id: 'phase',
    label: 'Phase-Cut',
    caption:
      'Mains AC is switched on partway through each half-cycle. The later it switches on, the less energy reaches the lamp.',
  },
  {
    id: 'pwm',
    label: 'PWM',
    caption:
      'The LED is switched fully on and off very quickly. The share of time it is on — the duty cycle — sets the brightness you see.',
  },
  {
    id: 'dali',
    label: 'DALI',
    caption:
      'A digital lighting-control protocol (IEC 62386). Controllers send addressed commands, such as a level from 0 to 254, over a two-wire bus. Shown: one level byte, bi-phase encoded.',
  },
  {
    id: 'analog',
    label: 'Analog',
    caption:
      'A DC control voltage sets the level. In the common 0–10 V scheme, a higher voltage means a brighter light.',
  },
];

const W = 400;
const H = 140;
const TOP = 22;
const BOT = 118;
const MID = (TOP + BOT) / 2;

function phasePath(level: number) {
  const a = (1 - level) * Math.PI; // firing angle within each half-cycle
  const amp = (BOT - TOP) / 2;
  let ghost = '';
  let solid = '';
  const N = 400;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * 4 * Math.PI; // two full cycles
    const x = (i / N) * W;
    const v = Math.sin(t);
    const inHalf = t % Math.PI;
    const on = level > 0 && inHalf >= a;
    ghost += `${i ? 'L' : 'M'}${x.toFixed(1)} ${(MID - v * amp).toFixed(1)}`;
    solid += `${i ? 'L' : 'M'}${x.toFixed(1)} ${(MID - (on ? v : 0) * amp).toFixed(1)}`;
  }
  return { ghost, solid };
}

function pwmPath(level: number) {
  const periods = 8;
  const pw = W / periods;
  let d = `M0 ${BOT}`;
  for (let p = 0; p < periods; p++) {
    const x0 = p * pw;
    const on = pw * level;
    if (level <= 0) d += `L${x0 + pw} ${BOT}`;
    else if (level >= 1) d += `L${x0} ${TOP}L${x0 + pw} ${TOP}`;
    else d += `L${x0} ${BOT}L${x0} ${TOP}L${x0 + on} ${TOP}L${x0 + on} ${BOT}L${x0 + pw} ${BOT}`;
  }
  return d;
}

function daliPath(value: number) {
  const bits = value.toString(2).padStart(8, '0').split('');
  const bw = W / 8;
  const hi = TOP + 10;
  const lo = BOT - 10;
  let d = '';
  bits.forEach((b, i) => {
    const x = i * bw;
    // Bi-phase: a "1" is a rising edge mid-bit, a "0" a falling edge.
    const [first, second] = b === '1' ? [lo, hi] : [hi, lo];
    d += `${i ? 'L' : 'M'}${x} ${first}L${x + bw / 2} ${first}L${x + bw / 2} ${second}L${x + bw} ${second}`;
  });
  return { d, bits };
}

/** A bulb whose filament, glass and rays follow the slider through --lvl, so brightness reads as light, not colour */
function Bulb() {
  const rays = [-150, -120, -90, -60, -30, 0, 180];
  return (
    <svg className="dim-lamp" viewBox="0 0 44 60" aria-hidden="true">
      <circle className="dim-lamp-halo" cx="22" cy="20" r="21" />
      <g className="dim-lamp-rays">
        {rays.map((a) => (
          <line key={a} x1="22" y1="-1" x2="22" y2="-6" transform={`rotate(${a + 90} 22 20)`} />
        ))}
      </g>
      <path className="dim-lamp-glass" d={GLASS} />
      <path className="dim-lamp-glass dim-lamp-glass--lit" d={GLASS} />
      <path className="dim-lamp-wire" d="M18 37V28M26 37V28" />
      <path className="dim-lamp-fil" d="M18 28l1.3-4 1.4 3 1.3-3 1.4 3 1.3-3 1.3 4" />
      <path className="dim-lamp-fil dim-lamp-fil--lit" d="M18 28l1.3-4 1.4 3 1.3-3 1.4 3 1.3-3 1.3 4" />
      <g className="dim-lamp-base">
        <rect x="15" y="40" width="14" height="3.2" rx="1.2" />
        <rect x="15.5" y="44" width="13" height="3.2" rx="1.2" />
        <rect x="16" y="48" width="12" height="3.2" rx="1.2" />
        <path d="M18 52h8l-1.5 3.5h-5z" />
      </g>
    </svg>
  );
}
const GLASS = 'M22 4a15 15 0 0 1 9.4 26.7c-1.9 1.6-2.4 3.4-2.4 5.6V39H15v-2.7c0-2.2-.5-4-2.4-5.6A15 15 0 0 1 22 4z';

export function DimmingDemo() {
  const [mode, setMode] = useState<Mode>('phase');
  const [pct, setPct] = useState(60);
  const sliderId = useId();
  const level = pct / 100;
  const m = MODES.find((x) => x.id === mode)!;

  const phase = useMemo(() => phasePath(level), [level]);
  const pwm = useMemo(() => pwmPath(level), [level]);
  const daliValue = Math.round(level * 254);
  const dali = useMemo(() => daliPath(daliValue), [daliValue]);
  const volts = level * 10;

  const readout =
    mode === 'phase'
      ? `Conducts ${Math.round(level * 180)}° of each 180° half-cycle`
      : mode === 'pwm'
        ? `Duty cycle ${pct}%`
        : mode === 'dali'
          ? `Level ${daliValue} / 254 → 0b${daliValue.toString(2).padStart(8, '0')}`
          : `Control voltage ≈ ${volts.toFixed(1)} V`;

  return (
    <div className="dim" style={{ '--lvl': level } as CSSProperties}>
      <div className="dim-head">
        <div className="dim-modes" role="group" aria-label="Dimming technique">
          {MODES.map((x) => (
            <button key={x.id} type="button" className="dim-mode" aria-pressed={mode === x.id} onClick={() => setMode(x.id)}>
              {x.label}
            </button>
          ))}
        </div>
        <Bulb />
      </div>

      <figure className="dim-scope">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${m.label} waveform at ${pct}% brightness. ${readout}.`}>
          <g className="dim-grid">
            {Array.from({ length: 9 }, (_, i) => (
              <line key={`v${i}`} x1={(i * W) / 8} x2={(i * W) / 8} y1="6" y2={H - 6} />
            ))}
            {[TOP, MID, BOT].map((y) => (
              <line key={`h${y}`} x1="0" x2={W} y1={y} y2={y} />
            ))}
          </g>
          {mode === 'phase' && (
            <>
              <path className="dim-ghost" d={phase.ghost} />
              <path className="dim-wave" d={phase.solid} />
            </>
          )}
          {mode === 'pwm' && <path className="dim-wave" d={pwm} />}
          {mode === 'dali' && (
            <>
              <path className="dim-wave" d={dali.d} />
              {dali.bits.map((b, i) => (
                <text key={i} x={(i + 0.5) * (W / 8)} y={H - 2} className="dim-bit" textAnchor="middle">
                  {b}
                </text>
              ))}
            </>
          )}
          {mode === 'analog' && (
            <>
              <text x="4" y={TOP - 6} className="dim-bit" textAnchor="start">10 V</text>
              <text x="4" y={BOT + 14} className="dim-bit" textAnchor="start">0 V</text>
              <path className="dim-wave" d={`M0 ${BOT - level * (BOT - TOP)}H${W}`} />
            </>
          )}
        </svg>
        <figcaption className="dim-readout mono">{readout}</figcaption>
      </figure>

      <div className="dim-control">
        <label htmlFor={sliderId}>Brightness</label>
        <input
          id={sliderId}
          type="range"
          min={0}
          max={100}
          step={1}
          value={pct}
          onChange={(e) => setPct(Number(e.target.value))}
          aria-valuetext={`${pct}%`}
        />
        <output htmlFor={sliderId} className="mono">
          {pct}%
        </output>
      </div>
      <p className="dim-caption">{m.caption}</p>
      <p className="dim-note">Illustrative waveforms, simplified for clarity.</p>
    </div>
  );
}
