import { useState, type CSSProperties, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export type MapStatus = 'built' | 'progress';

export type MapNode = {
  id: string;
  label: string;
  icon: LucideIcon;
  /** Position as a percentage of the map's width and height. */
  x: number;
  y: number;
  status?: MapStatus;
  /** Short mono line under the title in the detail panel. */
  parts?: string;
  detail: string;
};

export type MapEdge = {
  from: string;
  to: string;
  status?: MapStatus;
  /** 'flow' animates along the line (energy or data moving). */
  kind?: 'link' | 'flow' | 'data';
};

const STATUS_LABEL: Record<MapStatus, string> = { built: 'Built', progress: 'In progress' };

/**
 * Interactive map of a system. Wires are drawn in SVG; nodes are real buttons laid over it, so the map is
 * keyboard- and screen-reader-friendly. In narrow containers the wires drop away and nodes reflow into a grid.
 * Selecting a node highlights its connections and explains it below.
 */
export function NodeMap({
  nodes,
  edges,
  initial,
  ratio = 0.62,
  label,
  legend,
  note,
}: {
  nodes: MapNode[];
  edges: MapEdge[];
  initial: string;
  /** Height / width of the map area. */
  ratio?: number;
  label: string;
  legend?: ReactNode;
  note?: string;
}) {
  const [active, setActive] = useState(initial);
  const node = nodes.find((n) => n.id === active)!;
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const H = 100 * ratio;
  const linked = new Set(edges.flatMap((e) => (e.from === active ? [e.to] : e.to === active ? [e.from] : [])));

  return (
    <div className="dg">
      {legend && <div className="nm-legend">{legend}</div>}
      <div className="nm" style={{ '--nm-ratio': ratio } as CSSProperties}>
        <svg className="nm-wires" viewBox={`0 0 100 ${H}`} preserveAspectRatio="none" aria-hidden="true">
          {edges.map((e) => {
            const a = byId[e.from];
            const b = byId[e.to];
            const on = e.from === active || e.to === active;
            // Elbow wires, like traces on a board: leave vertically, turn halfway.
            const ay = (a.y / 100) * H;
            const by = (b.y / 100) * H;
            const my = (ay + by) / 2;
            const d = a.x === b.x || ay === by ? `M${a.x} ${ay}L${b.x} ${by}` : `M${a.x} ${ay}V${my}H${b.x}V${by}`;
            return (
              <path
                key={e.from + e.to}
                d={d}
                className={`nm-wire nm-wire--${e.kind ?? 'link'}${on ? ' is-on' : ''}`}
                data-status={e.status}
              />
            );
          })}
        </svg>
        <ul className="nm-nodes" role="list" aria-label={label}>
          {nodes.map((n) => (
            <li key={n.id} style={{ left: `${n.x}%`, top: `${n.y}%` }}>
              <button
                type="button"
                className={`nm-node${linked.has(n.id) ? ' is-linked' : ''}`}
                aria-pressed={n.id === active}
                data-status={n.status}
                onClick={() => setActive(n.id)}
              >
                <n.icon size={16} strokeWidth={1.75} aria-hidden="true" />
                <span>{n.label}</span>
                {n.status && <span className="sr-only">, {STATUS_LABEL[n.status]}</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="dg-detail" aria-live="polite">
        <strong>
          {node.label}
          {node.status && (
            <span className="nm-status" data-status={node.status}>
              {STATUS_LABEL[node.status]}
            </span>
          )}
        </strong>
        {node.parts && <span className="dg-parts">{node.parts}</span>}
        <p>{node.detail}</p>
      </div>
      {note && <p className="dg-note">{note}</p>}
    </div>
  );
}

export function LegendItem({ kind, children }: { kind: string; children: ReactNode }) {
  return (
    <span className="nm-key">
      <span className={`nm-swatch nm-swatch--${kind}`} aria-hidden="true" />
      {children}
    </span>
  );
}
