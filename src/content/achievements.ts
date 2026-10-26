import type { Achievement } from './schema';

export const achievements: Achievement[] = [
  {
    title: 'Smart India Hackathon 2023 — Finalist',
    context: 'Team leader for Smart Microgrid as a Service.',
    year: '2023',
    icon: 'Trophy',
    kind: 'award',
    relatedProject: 'smart-microgrid',
  },
  {
    title: 'Grand Contest 2024 — Selected',
    context: 'LiDAR-enabled smartwatch for visually impaired users.',
    year: '2024',
    icon: 'Award',
    kind: 'selection',
    relatedProject: 'lidar-smartwatch',
  },
  {
    title: 'IDE Bootcamp 2024',
    context: 'Participant at the National Institute of Technology, Goa.',
    year: '2024',
    icon: 'Rocket',
    kind: 'program',
  },
  {
    title: 'AI & ML in IoT — Outreach Program',
    context: 'Participant at the National Institute of Technology, Warangal.',
    icon: 'Brain',
    kind: 'program',
  },
  {
    title: 'Sumshodhini’24 — Technical Event Organiser',
    context: 'Organised a technical event at KITS Warangal.',
    year: '2024',
    icon: 'Users',
    kind: 'leadership',
  },
];
