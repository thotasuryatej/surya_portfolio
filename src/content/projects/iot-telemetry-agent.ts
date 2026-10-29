import { defineProject } from '../schema';

export default defineProject({
  slug: 'iot-telemetry-agent',
  title: 'IoT Telemetry Device Agent',
  short: 'Telemetry Agent',
  category: 'Embedded & IoT',
  summary:
    'A simulated firmware agent that buffers sensor data durably on flash and uploads it reliably over an unreliable link — within a 256 KB RAM / 8 MB flash budget.',
  status: 'Completed',
  period: { start: '2026-07', end: '2026-07' },
  updated: '2026-10',
  role: 'Sole author — architecture, C++17 implementation, simulator and documentation',
  technologies: ['C++17', 'CMake', 'Embedded systems', 'Flash storage', 'CRC16 / CRC32', 'IoT telemetry'],
  order: 5,
  visual: 'telemetry',
  diagram: 'telemetry-replay',
  overview: [
    'A connected device has to keep every sensor reading even when the network drops, the power is cut, or a burst of readings arrives faster than it can upload. This agent is designed around one rule: data only leaves local storage after the cloud confirms it received it.',
    'Built as a take-home assignment during a hiring process, not as work for a client or employer. There is no real hardware or cloud — a simulation driver scripts events against the real agent and prints every state change, the way a serial log off a board would read.',
  ],
  highlights: [
    'Flash-backed ring buffer: fixed-size records, O(1) addressing, no fragmentation or compaction.',
    'Crash-safe A/B checkpoints with CRC and version checks, for both the buffer and the device config.',
    'At-least-once delivery with a monotonic seq_id per record, so the cloud can drop duplicates from a retried batch.',
    'Exponential-backoff retry (2 s → 4 s → 8 s …, capped at 60 s) that gives up for the cycle instead of retrying forever.',
    'Priority-aware backpressure: when flash is full, CRITICAL readings are protected and low-priority samples are shed.',
    'Validated remote configuration: partial updates are range-checked; an invalid push is rejected and logged.',
    'No dynamic allocation in the hot path — fixed-capacity, std::array-backed batches and event queues.',
  ],
  sections: [
    {
      heading: 'How it was tested',
      body: [
        'The simulator runs four scenarios end to end: an outage with a sensor burst and two failed uploads before success; a power cut mid-flight followed by recovery of all 40 unacknowledged readings; a 10-record buffer flooded until full, with the critical reading kept; and a valid and an invalid remote config update.',
        'There is no separate unit-test suite; each behaviour is checked against the state printed at that point in the log.',
      ],
    },
    {
      heading: 'Design choices',
      body: [
        'At-least-once delivery with server-side deduplication was chosen over an exactly-once protocol, which would need a much harder distributed commit for little gain. For a fleet of 100,000 devices, the design document covers a compact binary wire format, stateless deduplication so ingestion scales horizontally, and jitter on retries to avoid synchronised reconnect storms.',
        'AI assistance (Claude) was used for boilerplate, first drafts of modules written to my design, and documentation; the module split, durability strategy, eviction policy and delivery guarantee were my decisions. The repository includes a full disclosure.',
      ],
    },
  ],
  links: [
    { label: 'Source on GitHub', href: 'https://github.com/thotasuryatej/iot-telemetry-device-agent', kind: 'source' },
    {
      label: 'Architecture document',
      href: 'https://github.com/thotasuryatej/iot-telemetry-device-agent/blob/main/docs/architecture/ARCHITECTURE.md',
      kind: 'document',
    },
  ],
});
