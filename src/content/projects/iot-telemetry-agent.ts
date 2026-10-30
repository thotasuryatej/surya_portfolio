import { defineProject } from '../schema';

export default defineProject({
  slug: 'iot-telemetry-agent',
  title: 'IoT Telemetry Device Agent',
  short: 'Telemetry Agent',
  category: 'Embedded & IoT',
  summary:
    'A simulated firmware agent that keeps sensor data safe on flash and uploads it reliably over an unreliable link — within a 256 KB RAM / 8 MB flash budget.',
  status: 'Completed',
  period: { start: '2026-07', end: '2026-07' },
  updated: '2026-10',
  role: 'Sole author — architecture, C++17 implementation, simulator and documentation',
  technologies: ['C++17', 'CMake', 'Embedded systems', 'Flash storage', 'IoT telemetry'],
  order: 5,
  visual: 'telemetry',
  overview: [
    'A connected device has to keep every sensor reading even when the network drops, the power is cut, or a burst of readings arrives faster than it can upload.',
    'Built as a take-home assignment during a hiring process, not as work for a client or employer. There is no real hardware or cloud: a simulator drives the agent through outages, power loss and full storage.',
  ],
  highlights: [
    'Keeps every reading through network outages and bursts of data.',
    'Recovers all unsent readings after a power cut.',
    'Protects critical readings when storage is full.',
    'Applies remote configuration changes only when they are valid.',
    'Runs within a tight memory budget, with no dynamic allocation in the hot path.',
  ],
  sections: [
    {
      heading: 'How it was built',
      body: [
        'AI assistance (Claude) was used for boilerplate, first drafts of modules written to my design, and documentation; the architecture and design decisions were mine.',
      ],
    },
  ],
  note: 'The source and architecture document are kept private. Happy to walk through them on request.',
});
