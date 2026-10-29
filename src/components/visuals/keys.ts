/** Keys that content files may use for `visual` and `diagram`. Kept separate so the validator can import them without React. */
export const visualKeys = ['iot-hub', 'web', 'queue', 'vision', 'microgrid', 'lidar', 'telemetry', 'blueprint'] as const;
export const diagramKeys = ['device-topology', 'fq-codel', 'energy-flow', 'vision-pipeline', 'site-anatomy', 'lidar-concept', 'telemetry-replay', 'dimming'] as const;

export type VisualKey = (typeof visualKeys)[number];
export type DiagramKey = (typeof diagramKeys)[number];
