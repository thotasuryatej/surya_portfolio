import type { ComponentType } from 'react';
import { articles, site } from '../content';
import { Hero } from './Hero';
import { About } from './About';
import { Journey } from './Journey';
import { Capabilities } from './Capabilities';
import { Projects } from './Projects';
import { Mindset } from './Mindset';
import { Experience } from './Experience';
import { Lab } from './Lab';
import { Writing } from './Writing';
import { Contact } from './Contact';

/** Section id (from site.ts) → component. To add a section, register it here and list it in site.ts. */
export const sectionComponents: Record<string, ComponentType> = {
  home: Hero,
  about: About,
  journey: Journey,
  build: Capabilities,
  projects: Projects,
  mindset: Mindset,
  experience: Experience,
  lab: Lab,
  writing: Writing,
  contact: Contact,
};

/** Sections that are enabled, registered and have something to show. */
const hasContent: Record<string, () => boolean> = {
  writing: () => articles.length > 0,
};

export const visibleSections = site.sections.filter(
  (s) => s.enabled && sectionComponents[s.id] && (hasContent[s.id]?.() ?? true),
);
