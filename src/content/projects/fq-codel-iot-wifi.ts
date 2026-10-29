import { defineProject } from '../schema';

export default defineProject({
  slug: 'fq-codel-iot-wifi',
  title: 'FQ-CoDel Scheduling for IoT Traffic in Wi-Fi Networks',
  short: 'FQ-CoDel for IoT',
  category: 'Network Research',
  summary:
    'Fair-queuing congestion control so small, time-sensitive IoT packets are not stuck behind bulk traffic — simulated and analysed in NS-3.',
  status: 'Research',
  period: { start: '2025-04' },
  role: 'Designed and implemented the simulation and analysis',
  technologies: ['NS-3', 'NetAnim', 'FQ-CoDel', 'Queue management', 'Wi-Fi'],
  order: 6,
  visual: 'queue',
  diagram: 'fq-codel',
  overview: [
    'IoT devices usually send small, periodic messages — a sensor reading, a switch state. On a shared Wi-Fi network those packets can end up waiting behind large downloads in a single queue, which adds latency exactly where it hurts.',
    'This project applied FQ-CoDel (Flow Queue CoDel) to IoT traffic in Wi-Fi networks. FQ-CoDel gives each flow its own queue and serves them in turn, while CoDel drops packets that have waited too long — keeping queues short and sharing the link fairly.',
    'I simulated the network in NS-3, visualised it in NetAnim, and evaluated latency, throughput and congestion behaviour under different network conditions.',
  ],
  highlights: [
    'Designed and implemented fair-queuing-based congestion control for IoT traffic.',
    'Used FQ-CoDel to improve traffic prioritisation and network efficiency for IoT devices.',
    'Evaluated latency, throughput and congestion behaviour under different conditions.',
    'Optimised queue-management settings for stable IoT communication.',
  ],
  links: [
    { label: 'Source on GitHub', href: 'https://github.com/thotasuryatej/Traffic-Management-in-WiFi-Networks', kind: 'source' },
  ],
  note: 'The interactive diagram is a conceptual illustration of how FQ-CoDel works, not data from the simulation.',
});
