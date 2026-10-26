import { useId, useState, type CSSProperties } from 'react';

const C = 299_792_458; // speed of light, m/s

/**
 * The sensing principle behind the concept: a pulse leaves the watch, reflects off an obstacle and returns;
 * the round-trip time gives the distance. The numbers are physics (t = 2d / c), not project measurements.
 */
export function LidarConcept() {
  const [d, setD] = useState(2);
  const id = useId();
  const ns = ((2 * d) / C) * 1e9;
  // Obstacle position in the drawing: 0.5 m → near, 5 m → far.
  const ox = 120 + ((d - 0.5) / 4.5) * 170;

  return (
    <div className="dg">
      <div className="lc-stage">
        <svg viewBox="0 0 320 150" role="img" aria-label={`A light pulse travels ${d.toFixed(1)} metres to an obstacle and back`}>
          <path className="lc-floor" d="M0 128H320" />
          {/* wrist and watch */}
          <path className="lc-arm" d="M0 84C30 80 52 80 70 82V104C52 106 30 106 0 102Z" />
          <rect className="lc-watch" x="52" y="72" width="34" height="42" rx="9" />
          <rect className="lc-screen" x="57" y="78" width="24" height="30" rx="5" />
          <circle className="lc-emitter" cx="86" cy="93" r="3" />
          {/* outgoing and returning pulses */}
          <g style={{ '--lc-x': `${ox - 92}px` } as CSSProperties}>
            <path className="lc-beam" d={`M90 90H${ox}`} />
            <path className="lc-beam lc-beam--back" d={`M${ox} 96H90`} />
            <circle className="lc-pulse" cx="90" cy="90" r="3" />
          </g>
          {/* obstacle */}
          <rect className="lc-obstacle" x={ox} y="40" width="14" height="88" rx="3" />
          <path className="lc-dim" d={`M90 136V144M90 140H${ox}M${ox} 136V144`} />
          <text className="lc-dim-t" x={(90 + ox) / 2} y="148" textAnchor="middle">
            {d.toFixed(1)} m
          </text>
        </svg>
      </div>

      <label className="dim-control" htmlFor={id}>
        <span>Distance</span>
        <input id={id} type="range" min={0.5} max={5} step={0.1} value={d} onChange={(e) => setD(Number(e.target.value))} />
        <output htmlFor={id} className="mono">
          {d.toFixed(1)}
        </output>
      </label>

      <dl className="lc-math">
        <div>
          <dt>Path</dt>
          <dd className="mono">2 × {d.toFixed(1)} m</dd>
        </div>
        <div>
          <dt>Round trip at light speed</dt>
          <dd className="mono">≈ {ns.toFixed(1)} ns</dd>
        </div>
        <div>
          <dt>So</dt>
          <dd className="mono">d = c × t ÷ 2</dd>
        </div>
      </dl>
      <p className="dg-note">
        Illustrates how LiDAR measures distance — not the project&apos;s design. How the watch presents distance to the
        wearer is part of the write-up still to be documented.
      </p>
    </div>
  );
}
