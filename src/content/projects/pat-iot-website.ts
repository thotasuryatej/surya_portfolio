import { defineProject } from '../schema';

export default defineProject({
  slug: 'pat-iot-website',
  title: 'PAT IoT Solutions Website',
  category: 'Web',
  summary:
    'Designed and deployed the company website alongside my firmware role, using Claude AI for UI development, deployment and workflow integration.',
  status: 'Deployed',
  period: { start: '2026-04' },
  updated: '2026-04',
  role: 'Designer & developer — UI, content structure, deployment',
  technologies: ['HTML', 'CSS', 'Responsive UI', 'Deployment', 'Claude AI'],
  order: 3,
  visual: 'web',
  diagram: 'site-anatomy',
  // A real screenshot of the live home page, captured 2026-10-28 (1440 × 810)
  cover: {
    type: 'image',
    src: '/media/projects/pat-iot-website/home.webp',
    alt: 'The patiot.in home page: "Transform Your Living" over a living room with PAT IoT smart switches on the wall',
  },
  overview: [
    'Beyond embedded development, I took on the PAT IoT Solutions website: designing the interface, structuring product and company information, and getting it deployed for production use.',
    'I used Claude AI throughout — for UI development, deployment and workflow integration. It was a practical way to ship quality web work while keeping my main focus on firmware, and it is one of the reasons I keep exploring AI-assisted workflows.',
  ],
  highlights: [
    'Responsive UI and modern layouts for cross-platform compatibility.',
    'Structured product and company information for a clearer user experience and better accessibility.',
    'Deployment workflows and front-end improvements for production use.',
  ],
  links: [{ label: 'Visit patiot.in', href: 'https://patiot.in/', kind: 'website' }],
});
