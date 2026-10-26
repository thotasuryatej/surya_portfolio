/**
 * LEARNING LAB TEMPLATE — copy this file, rename it to `<your-slug>.ts`, and fill it in.
 * Files that start with "_" are ignored by the site.
 *
 * Only log things you have actually started. Leave `discovered` out until you have
 * something real to say — the site simply hides empty fields.
 */
import { defineLabEntry } from '../schema';

export default defineLabEntry({
  slug: 'my-experiment',
  title: 'What I am exploring',
  category: 'AI tools', // e.g. AI tools | Protocols | Hardware | Frameworks | Dev tools
  summary: 'One or two sentences about what this is.',
  status: 'Exploring', // 'Learning' | 'Exploring' | 'Building' | 'Testing' | 'Completed' | 'Paused'
  started: '2026-11',
  updated: '2026-11',
  goal: 'What I wanted to learn.',
  tried: ['What I tried first'],
  // discovered: ['What I found out — including what did not work'],
  // built: 'What I built with it',
  // relatedProject: 'smart-home-iot-hub',
  // media: [{ type: 'image', src: '/media/lab/my-experiment/screenshot.webp', alt: 'Describe it' }],
  // links: [{ label: 'Notes', href: 'https://...', kind: 'article' }],
});
