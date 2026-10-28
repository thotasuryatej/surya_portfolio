import { defineProject } from '../schema';

export default defineProject({
  slug: 'lidar-smartwatch',
  title: 'LiDAR-Enabled Smartwatch for Visually Impaired Users',
  category: 'Assistive Tech',
  summary:
    'A wearable concept that uses LiDAR sensing to help visually impaired people perceive their surroundings. Selected for the Grand Contest 2024.',
  status: 'Passion project',
  period: { start: '2024' },
  technologies: ['LiDAR', 'Wearables', 'Assistive technology'],
  recognition: 'Grand Contest 2024 — Selected',
  order: 6,
  visual: 'lidar',
  diagram: 'lidar-concept',
  overview: [
    'LiDAR measures distance by timing reflected light. Putting that kind of sensing into a smartwatch could give visually impaired users an extra sense of what is around them — something that is always on the wrist, not in the hand.',
    'I built it out of my own interest, not for a course, and it was selected for the Grand Contest 2024.',
  ],
  note: 'A fuller write-up of this project — design, hardware and results — is still to be documented.',
});
