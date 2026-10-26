import type { ReactNode } from 'react';
import type { VisualKey } from './keys';
import './visuals.css';

/**
 * Built-in project illustrations. They are abstract drawings, not photos or screenshots,
 * and are always shown with an "Illustration" label. Add real media through `cover` in a project file.
 */

/** Shared gradients for every illustration. Rendered once in App so IDs stay unique. */
export function VisualDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
        <defs>
        <pattern id="pv-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" className="pv-gridline" />
        </pattern>
        <radialGradient id="pv-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" style={{ stopColor: 'var(--cyan)' }} stopOpacity="0.35" />
          <stop offset="1" style={{ stopColor: 'var(--cyan)' }} stopOpacity="0" />
        </radialGradient>
        {/* userSpaceOnUse: a bounding-box gradient would not paint perfectly straight lines */}
        <linearGradient id="pv-stroke" x1="0" y1="0" x2="400" y2="250" gradientUnits="userSpaceOnUse">
          <stop offset="0" style={{ stopColor: 'var(--logo-1)' }} />
          <stop offset="0.5" style={{ stopColor: 'var(--cyan)' }} />
          <stop offset="1" style={{ stopColor: 'var(--violet)' }} />
        </linearGradient>
      </defs>
    </svg>
  );
}

const W = 400;
const H = 250;

function Frame({ children, label }: { children: ReactNode; label: string }) {
  return (
    <svg className="pv" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true" data-label={label}>
      <rect width={W} height={H} fill="url(#pv-grid)" />
      {children}
    </svg>
  );
}

function IotHub() {
  const devices = [
    [70, 60],
    [330, 60],
    [60, 190],
    [340, 190],
    [200, 32],
    [200, 222],
  ];
  return (
    <Frame label="IoT hub">
      <circle cx="200" cy="125" r="110" fill="url(#pv-glow)" />
      {devices.map(([x, y], i) => (
        <g key={i}>
          <path className="pv-trace pv-flow" d={`M200 125L${x} ${y}`} style={{ animationDelay: `${i * -0.4}s` }} />
          <rect className="pv-node" x={x - 14} y={y - 14} width="28" height="28" rx="8" />
          <circle className="pv-led" cx={x} cy={y} r="3" style={{ animationDelay: `${i * 0.3}s` }} />
        </g>
      ))}
      <circle className="pv-ring" cx="200" cy="125" r="44" />
      <circle className="pv-ring pv-ring--dash" cx="200" cy="125" r="62" />
      <rect className="pv-chip" x="168" y="105" width="64" height="40" rx="10" />
      <text className="pv-label" x="200" y="129" textAnchor="middle">
        MATTER
      </text>
    </Frame>
  );
}

function Web() {
  return (
    <Frame label="Website">
      <circle cx="260" cy="90" r="120" fill="url(#pv-glow)" />
      <g transform="translate(70 40)">
        <rect className="pv-node" width="260" height="170" rx="14" />
        <path className="pv-trace" d="M0 28H260" />
        {[16, 30, 44].map((x) => (
          <circle key={x} cx={x} cy="14" r="4" className="pv-dot" />
        ))}
        <rect className="pv-fill" x="20" y="48" width="120" height="14" rx="4" />
        <rect className="pv-fill pv-fill--dim" x="20" y="70" width="180" height="8" rx="4" />
        <rect className="pv-fill pv-fill--dim" x="20" y="84" width="150" height="8" rx="4" />
        <rect className="pv-cta" x="20" y="104" width="70" height="20" rx="10" />
        {[0, 1, 2].map((i) => (
          <rect key={i} className="pv-card" x={20 + i * 76} y="136" width="68" height="22" rx="6" />
        ))}
      </g>
      <path className="pv-cursor" d="M290 150l0 26 7-7 6 12 5-2-6-12 10 0z" />
    </Frame>
  );
}

function Queue() {
  const flows = [
    { y: 70, n: 5, cls: 'pv-pkt--bulk' },
    { y: 125, n: 2, cls: 'pv-pkt--iot' },
    { y: 180, n: 3, cls: 'pv-pkt--iot2' },
  ];
  return (
    <Frame label="Fair queuing">
      {flows.map((f, i) => (
        <g key={i}>
          <path className="pv-trace" d={`M30 ${f.y}H250L300 125`} />
          {Array.from({ length: f.n }, (_, k) => (
            <rect
              key={k}
              className={`pv-pkt ${f.cls}`}
              x={220 - k * 30}
              y={f.y - 9}
              width={f.cls === 'pv-pkt--bulk' ? 24 : 12}
              height="18"
              rx="4"
            />
          ))}
        </g>
      ))}
      <circle className="pv-ring" cx="310" cy="125" r="22" />
      <path className="pv-trace pv-flow" d="M332 125H380" />
      <text className="pv-label" x="310" y="129" textAnchor="middle">
        FQ
      </text>
    </Frame>
  );
}

function Vision() {
  return (
    <Frame label="Computer vision">
      <circle cx="200" cy="125" r="120" fill="url(#pv-glow)" opacity="0.6" />
      {/* Abstract scene: shapes only, no real imagery */}
      <path className="pv-fill pv-fill--dim" d="M0 210L90 150L160 190L250 130L400 200V250H0z" />
      <g className="pv-box">
        <rect x="120" y="70" width="70" height="110" rx="4" />
        <text className="pv-label pv-label--sm" x="120" y="62">
          person
        </text>
      </g>
      <g className="pv-box pv-box--alt">
        <rect x="240" y="96" width="90" height="62" rx="4" />
        <text className="pv-label pv-label--sm" x="240" y="88">
          object
        </text>
      </g>
      <path className="pv-scan" d="M0 0H400" />
      {[
        [20, 20],
        [380, 20],
        [20, 230],
        [380, 230],
      ].map(([x, y], i) => (
        <path
          key={i}
          className="pv-trace"
          d={`M${x} ${y + (y < 100 ? 16 : -16)}V${y}H${x + (x < 200 ? 16 : -16)}`}
        />
      ))}
    </Frame>
  );
}

function Microgrid() {
  return (
    <Frame label="Microgrid">
      <circle cx="200" cy="125" r="100" fill="url(#pv-glow)" opacity="0.7" />
      <g transform="translate(50 50)">
        <rect className="pv-node" width="70" height="44" rx="6" />
        {[0, 1, 2].map((i) => (
          <path key={i} className="pv-trace" d={`M${8 + i * 22} 6V38`} />
        ))}
      </g>
      <g transform="translate(280 46)">
        <path className="pv-trace" d="M30 60V0M30 6L10 16M30 6L50 16M30 6L36 -14" />
      </g>
      <g transform="translate(50 160)">
        <rect className="pv-node" width="70" height="40" rx="8" />
        <rect className="pv-fill" x="8" y="10" width="40" height="20" rx="3" />
      </g>
      <g transform="translate(290 160)">
        <path className="pv-node" d="M0 40V14L30 -6L60 14V40z" />
      </g>
      <rect className="pv-chip" x="176" y="101" width="48" height="48" rx="10" />
      <text className="pv-label" x="200" y="129" textAnchor="middle">
        GRID
      </text>
      <path className="pv-trace pv-flow" d="M120 72H176V110" />
      <path className="pv-trace pv-flow" d="M310 106V125H224" />
      <path className="pv-trace pv-flow" d="M120 180H186V149" />
      <path className="pv-trace pv-flow pv-flow--rev" d="M214 149V180H290" />
    </Frame>
  );
}

function Lidar() {
  const pts = Array.from({ length: 36 }, (_, i) => {
    const a = (i / 36) * Math.PI * 2;
    const r = 70 + 18 * Math.sin(i * 1.7) + 10 * Math.cos(i * 0.9);
    return [200 + Math.cos(a) * r * 1.4, 125 + Math.sin(a) * r * 0.8] as const;
  });
  return (
    <Frame label="LiDAR">
      <circle cx="200" cy="125" r="110" fill="url(#pv-glow)" opacity="0.6" />
      {pts.map(([x, y], i) => (
        <circle key={i} className="pv-point" cx={x} cy={y} r="2.2" style={{ animationDelay: `${(i / 36) * 3}s` }} />
      ))}
      <g className="pv-sweep">
        <path d="M200 125L330 95A140 80 0 0 1 335 140z" />
      </g>
      <rect className="pv-node" x="178" y="98" width="44" height="54" rx="16" />
      <circle className="pv-led" cx="200" cy="125" r="4" />
    </Frame>
  );
}

/** Sensor -> flash ring buffer -> cloud, with one slot marked critical. */
function Telemetry() {
  const slots = Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    return [200 + Math.cos(a) * 52, 125 + Math.sin(a) * 52] as const;
  });
  return (
    <Frame label="Telemetry">
      <circle cx="200" cy="125" r="100" fill="url(#pv-glow)" opacity="0.7" />
      <path className="pv-trace pv-flow" d="M70 125H140" />
      <path className="pv-trace pv-flow" d="M260 125H330" />
      <rect className="pv-node" x="38" y="107" width="36" height="36" rx="10" />
      <circle className="pv-led" cx="56" cy="125" r="4" />
      <circle className="pv-ring pv-ring--dash" cx="200" cy="125" r="52" />
      {slots.map(([x, y], i) => (
        <rect key={i} className={i === 2 ? 'pv-chip pv-slot--crit' : 'pv-chip'} x={x - 8} y={y - 8} width="16" height="16" rx="4" />
      ))}
      <text className="pv-label pv-label--sm" x="200" y="129" textAnchor="middle">
        flash
      </text>
      <path className="pv-node" d="M336 138h34a14 14 0 0 0 0-28a20 20 0 0 0-38-4a14 14 0 0 0 4 32z" />
    </Frame>
  );
}

/** Generic fallback, varied by a seed so cards without a dedicated visual still differ. */
function Blueprint({ seed = 'x' }: { seed?: string }) {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const rnd = () => ((h = (h * 1103515245 + 12345) >>> 0) / 2 ** 32);
  const nodes = Array.from({ length: 6 }, () => [40 + rnd() * 320, 30 + rnd() * 190] as const);
  return (
    <Frame label="Blueprint">
      <circle cx="200" cy="125" r="110" fill="url(#pv-glow)" opacity="0.5" />
      {nodes.slice(1).map(([x, y], i) => (
        <path key={i} className="pv-trace" d={`M${nodes[i][0]} ${nodes[i][1]}H${x}V${y}`} />
      ))}
      {nodes.map(([x, y], i) => (
        <rect key={i} className="pv-node" x={x - 10} y={y - 10} width="20" height="20" rx="5" />
      ))}
    </Frame>
  );
}

const VISUALS: Record<VisualKey, (p: { seed?: string }) => ReactNode> = {
  'iot-hub': IotHub,
  web: Web,
  queue: Queue,
  vision: Vision,
  microgrid: Microgrid,
  lidar: Lidar,
  telemetry: Telemetry,
  blueprint: Blueprint,
};

export function ProjectVisual({ name, seed }: { name?: string; seed?: string }) {
  const V = VISUALS[(name as VisualKey) ?? 'blueprint'] ?? Blueprint;
  return <V seed={seed} />;
}
