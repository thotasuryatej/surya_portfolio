import type { ComponentType } from 'react';
import type { DiagramKey } from '../visuals/keys';
import { DeviceTopology } from './DeviceTopology';
import { FqCodelSim } from './FqCodelSim';
import { EnergyFlow } from './EnergyFlow';
import { VisionPipeline } from './VisionPipeline';
import { SiteAnatomy } from './SiteAnatomy';
import { LidarConcept } from './LidarConcept';
import { TelemetryReplay } from './TelemetryReplay';
import './diagrams.css';

const DIAGRAMS: Record<DiagramKey, { title: string; Component: ComponentType }> = {
  'device-topology': { title: 'Device topology', Component: DeviceTopology },
  'fq-codel': { title: 'FIFO vs FQ-CoDel, interactively', Component: FqCodelSim },
  'energy-flow': { title: 'How the platform sees the grid', Component: EnergyFlow },
  'vision-pipeline': { title: 'Detection workflow', Component: VisionPipeline },
  'site-anatomy': { title: 'Anatomy of the site', Component: SiteAnatomy },
  'lidar-concept': { title: 'The sensing idea', Component: LidarConcept },
  'telemetry-replay': { title: 'Replay the simulator', Component: TelemetryReplay },
};

export function Diagram({ name }: { name: string }) {
  const d = DIAGRAMS[name as DiagramKey];
  if (!d) return null;
  return (
    <section className="dg-wrap" aria-label={d.title}>
      <h3 className="dlg-h">{d.title}</h3>
      <d.Component />
    </section>
  );
}
