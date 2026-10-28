/**
 * PROJECT TEMPLATE — copy this file, rename it to `<your-slug>.ts`, and fill it in.
 * Files that start with "_" are ignored by the site, so this template never appears.
 *
 * Required: slug, title, category, summary, status, period, technologies, overview.
 * Everything else is optional — leave it out rather than writing placeholder text.
 */
import { defineProject } from '../schema';

export default defineProject({
  slug: 'my-new-project', // lowercase-with-dashes, must be unique; becomes /#project/my-new-project
  title: 'My New Project',
  category: 'Embedded & IoT', // reuse an existing category to keep the filters tidy
  summary: 'One sentence that explains what it is and why it matters.',
  status: 'In progress', // 'In progress' | 'Deployed' | 'Completed' | 'Prototype' | 'Research' | 'Academic' | 'Passion project' | 'Concept'
  period: { start: '2026-11' }, // add `end: '2027-02'` or `end: 'present'`
  updated: '2026-11',
  role: 'What I did on this project', // optional — delete if your individual role isn't documented
  technologies: ['ESP32', 'Embedded C'],
  // recognition: 'Award or selection, if any',
  // featured: false,   // true = big card at the top (only one project should be featured)
  // order: 10,         // lower numbers show first
  // visual: 'blueprint', // illustration on the card: iot-hub | web | queue | vision | microgrid | lidar | blueprint
  // diagram: 'device-topology', // optional interactive diagram: device-topology | fq-codel | energy-flow | vision-pipeline | site-anatomy | lidar-concept
  overview: [
    'First paragraph: the problem.',
    'Second paragraph: what I built and how.',
  ],
  // progress: { done: ['What works today'], ongoing: ['What is still being built'] },
  // highlights: ['Key point', 'Another key point'],
  // sections: [{ heading: 'A deeper topic', body: ['Paragraph'], bullets: ['Optional bullet'] }],
  // cover: { type: 'image', src: '/media/projects/my-new-project/cover.webp', alt: 'What the image shows' },
  // media: [
  //   { type: 'image', src: '/media/projects/my-new-project/board.webp', alt: 'The prototype board', caption: 'Rev A' },
  //   { type: 'video', src: '/media/projects/my-new-project/demo.mp4', alt: 'Demo of the device', poster: '/media/projects/my-new-project/poster.webp' },
  // ],
  // links: [{ label: 'Source code', href: 'https://github.com/...', kind: 'source' }],
  // note: 'An honest note, e.g. what is not public yet.',
});
