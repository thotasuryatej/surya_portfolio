import { defineProject } from '../schema';

export default defineProject({
  slug: 'smart-microgrid',
  title: 'Smart Microgrid as a Service',
  category: 'Energy',
  summary:
    'A platform to monitor how a microgrid generates, distributes and consumes energy — with analytics and usage suggestions. Smart India Hackathon 2023 finalist.',
  status: 'Prototype',
  period: { start: '2023-12' },
  role: 'Team leader — coordinated development and built the platform',
  technologies: ['Python', 'Machine learning', 'Energy monitoring', 'Analytics'],
  recognition: 'Smart India Hackathon 2023 — Finalist',
  order: 5,
  visual: 'microgrid',
  diagram: 'energy-flow',
  overview: [
    'Microgrids combine local generation, distribution and consumption. Running one efficiently depends on knowing what is happening across all three.',
    'For Smart India Hackathon 2023, our team built a system for energy generation, monitoring and consumption management, with real-time monitoring, analytics, and user-oriented suggestions for more efficient energy use. I led the team and coordinated the development workflow; the project reached the national finals.',
  ],
  highlights: [
    'Real-time monitoring and analytics to optimise power usage.',
    'Monitoring of generation, distribution and consumption patterns.',
    'User-oriented suggestions for efficient energy usage.',
    'Led the team as Team Leader during Smart India Hackathon 2023.',
  ],
  note: 'The energy-flow diagram is a conceptual illustration of the system, not a live dashboard.',
});
