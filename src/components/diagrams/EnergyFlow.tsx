import { Activity, Brain, House, Lightbulb, Network, Zap } from 'lucide-react';
import { LegendItem, NodeMap, type MapEdge, type MapNode } from './NodeMap';

// The project description names three monitored stages, analytics and usage suggestions — nothing more specific,
// so the map stays at that level (no invented sources, loads or figures).
const NODES: MapNode[] = [
  { id: 'gen', label: 'Generation', icon: Zap, x: 14, y: 22, detail: 'How much energy the microgrid produces locally, and when. Monitored in real time.' },
  { id: 'dist', label: 'Distribution', icon: Network, x: 50, y: 22, detail: 'How that energy moves across the microgrid to where it is needed. Monitored in real time.' },
  { id: 'use', label: 'Consumption', icon: House, x: 86, y: 22, detail: 'How, when and where energy is used. Monitored in real time.' },
  {
    id: 'mon',
    label: 'Real-time monitoring',
    icon: Activity,
    x: 50,
    y: 56,
    parts: 'generation · distribution · consumption patterns',
    detail: 'Readings from all three stages come together, so the platform sees the whole grid rather than one part of it.',
  },
  {
    id: 'ml',
    label: 'Analytics',
    icon: Brain,
    x: 22,
    y: 86,
    parts: 'Python · machine learning',
    detail: 'Analytics over the monitored patterns, used to find where power usage could be optimised.',
  },
  {
    id: 'tips',
    label: 'Usage suggestions',
    icon: Lightbulb,
    x: 78,
    y: 86,
    detail: 'User-oriented suggestions for using energy more efficiently — the part of the platform people act on.',
  },
];

const EDGES: MapEdge[] = [
  { from: 'gen', to: 'dist', kind: 'flow' },
  { from: 'dist', to: 'use', kind: 'flow' },
  { from: 'gen', to: 'mon', kind: 'data' },
  { from: 'dist', to: 'mon', kind: 'data' },
  { from: 'use', to: 'mon', kind: 'data' },
  { from: 'mon', to: 'ml', kind: 'data' },
  { from: 'ml', to: 'tips', kind: 'data' },
];

/** Conceptual flow of the SIH 2023 platform: energy across the top, monitoring data down into analytics and suggestions. */
export function EnergyFlow() {
  return (
    <NodeMap
      nodes={NODES}
      edges={EDGES}
      initial="mon"
      ratio={0.6}
      label="Microgrid stages and the platform that monitors them. Select one to learn about it."
      legend={
        <>
          <LegendItem kind="flow">Energy</LegendItem>
          <LegendItem kind="data">Monitoring data</LegendItem>
        </>
      }
      note="Conceptual illustration of the system — not a live dashboard."
    />
  );
}
