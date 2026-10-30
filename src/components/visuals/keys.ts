/** Keys that content files may use for `visual` and `diagram`. Kept separate so the validator can import them without React. */
export const visualKeys = ['iot-hub', 'web', 'queue', 'vision', 'microgrid', 'lidar', 'telemetry', 'blueprint'] as const;
export const diagramKeys = ['fq-codel', 'energy-flow', 'vision-pipeline', 'site-anatomy', 'lidar-concept', 'dimming'] as const;

export type VisualKey = (typeof visualKeys)[number];
export type DiagramKey = (typeof diagramKeys)[number];
