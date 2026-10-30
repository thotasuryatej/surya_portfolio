/**
 * Content schema — the single source of truth for every content type on the site.
 *
 * Dates use ISO-style strings:
 *   - Year precision:  "2025"  (when the month is unknown)
 *   - Month precision: "2025-09"
 *   - Day precision:   "2026-10-26"
 *   - Ongoing:         "present"
 *
 * Icons are Lucide icon names as strings (see src/components/ui/Icon.tsx for the
 * supported list). Unknown names fall back to a neutral icon and are reported by
 * `npm run validate`.
 */

export type MonthDate = `${number}` | `${number}-${number}` | `${number}-${number}-${number}`;
export type DateOrPresent = MonthDate | 'present';

export interface Period {
  start: MonthDate;
  end?: DateOrPresent;
}

export interface Link {
  label: string;
  href: string;
  /** Used to choose an icon. Defaults to "external". */
  kind?: 'website' | 'source' | 'demo' | 'article' | 'video' | 'document' | 'external';
}

export interface Media {
  type: 'image' | 'video';
  /** Path relative to /public, e.g. "/media/projects/my-project/board.webp" */
  src: string;
  /** Required for images: describe what the image shows. */
  alt: string;
  caption?: string;
  /** Optional poster image for videos. */
  poster?: string;
}

/* ------------------------------------------------------------------ Profile */

export interface SocialLink {
  label: string;
  href: string;
  /** Short handle shown next to the label, e.g. "thota-suryatej" */
  handle?: string;
  icon: 'linkedin' | 'github' | 'mail' | 'globe' | 'x' | 'youtube';
}

export interface Profile {
  name: string;
  fullName: string;
  /** Short version used in the nav mark tooltip and footer. */
  shortName: string;
  initials: string;
  headline: string;
  roles: string[];
  location: string;
  email: string;
  phone?: string;
  /** Whether to show the phone number in the contact section. */
  showPhone: boolean;
  availability?: string;
  /**
   * Portrait shown in the hero → About transition. Set `placeholder: false` once `src` is a real photo
   * (portrait orientation, about 4:5, at least 1000px tall). See CONTENT_GUIDE.md.
   */
  /** `srcDark`: optional photo shown in the dark theme instead of `src` */
  portrait?: { src: string; srcDark?: string; alt: string; placeholder: boolean };
  socials: SocialLink[];
  resume: {
    /** Path in /public. Replace the file and keep the name, or update this path. */
    file: string;
    /** Filename offered to the visitor when downloading. */
    downloadName: string;
    updated: MonthDate;
  };
}

/* --------------------------------------------------------------------- Hero */

export interface HeroNode {
  id: string;
  label: string;
  icon: string;
  /** One or two sentences shown when the node is selected. */
  detail: string;
  /** What kind of evidence backs this node. */
  evidence: Evidence;
}

export interface HeroContent {
  eyebrow: string[];
  title: string;
  /** Words within the title that receive the accent treatment. */
  accent?: string;
  /** Optional paragraph under the title. Left out for now: visitors asked for less to read up front. */
  lead?: string;
  /** Optional "currently" line under the buttons. */
  now?: string;
  primaryAction: { label: string; href: string };
  secondaryAction: { label: string; href: string };
  nodes: HeroNode[];
}

/* -------------------------------------------------------------------- About */

export interface AboutContent {
  title: string;
  intro: string[];
  /** Optional one-line statement shown large under the About grid; its words light up as it scrolls into view. */
  statement?: string;
  more: string[];
  /** "At a glance" tiles: a few words each, so a visitor can scan them instead of reading. */
  glance: { icon: string; label: string; items: string[] }[];
}

/* ------------------------------------------------------------------ Journey */

/** One stop on the Journey timeline. Keep `text` to one line; link a project or a job logo when there is one. */
/** A stretch of the Journey (e.g. "During B.Tech"), shown as a labelled band over its stops. */
export interface JourneyPhase {
  id: string;
  label: string;
  /** e.g. "Nov 2021 – 2025" */
  range: string;
}

export interface Milestone {
  /** id of the JourneyPhase this stop belongs to */
  phase: string;
  /** Start date label, e.g. "Sep 2025" or "2024". */
  when: string;
  /** Optional end, e.g. "2025" or "Present"; shown as "when – until". */
  until?: string;
  title: string;
  text: string;
  icon: string;
  kind: 'study' | 'award' | 'work' | 'build';
  project?: string;
  logo?: { src: string; alt: string };
}

/* ------------------------------------------------------------- Capabilities */

/**
 * professional — done in paid work (backed by the resume)
 * academic     — done in university / hackathon projects
 * exploring    — personal learning or experiments
 */
export type Evidence = 'professional' | 'academic' | 'exploring';

export interface Capability {
  id: string;
  title: string;
  icon: string;
  summary: string;
  detail: string;
  technologies: string[];
  /** One or more kinds of evidence. Shown as badges. */
  evidence: Evidence[];
  /** Project slugs to link to. */
  relatedProjects?: string[];
  /** Optional interactive demo key, see src/components/capabilities/demos.tsx */
  demo?: 'dimming';
}

/* ----------------------------------------------------------------- Projects */

export const projectStatuses = ['In progress', 'Deployed', 'Completed', 'Prototype', 'Research', 'Academic', 'Passion project', 'Concept'] as const;
export type ProjectStatus = (typeof projectStatuses)[number];

export interface CaseStudySection {
  heading: string;
  body: string[];
  bullets?: string[];
}

export interface Project {
  /** URL-safe id, also used in the share link: /#project/<slug> */
  slug: string;
  title: string;
  /** A few words for the row of names under the Projects carousel. Defaults to the title. */
  short?: string;
  category: string;
  /** One sentence for cards. */
  summary: string;
  status: ProjectStatus;
  period: Period;
  /** Last time this entry was meaningfully updated. */
  updated?: MonthDate;
  /** What I did. Leave out when my individual role is not documented — the site then omits it. */
  role?: string;
  technologies: string[];
  /** Short recognition line, e.g. "Smart India Hackathon 2023 — Finalist" */
  recognition?: string;
  /** Show as the large card at the top of the gallery. */
  featured?: boolean;
  /** Lower numbers appear first. Defaults to 100. */
  order?: number;
  /** Built-in illustration key (src/components/visuals). Defaults to "blueprint". */
  visual?: string;
  /** Optional image to use instead of the illustration on the card. */
  cover?: Media;
  /** Interactive diagram key(s) shown in the case study, in order (src/components/diagrams). */
  diagram?: string | string[];
  overview: string[];
  /** Separate verified, finished work from work that is still in progress. */
  progress?: { done: string[]; ongoing?: string[] };
  highlights?: string[];
  sections?: CaseStudySection[];
  media?: Media[];
  links?: Link[];
  /** A short, honest note shown in the case study (e.g. about missing details). */
  note?: string;
}

/* --------------------------------------------------------------- Experience */

export interface Job {
  company: string;
  role: string;
  location: string;
  period: Period;
  summary: string;
  points: string[];
  technologies: string[];
  website?: string;
  /** Official company logo in /public. Only use a logo taken from the company's own site; note the source. */
  logo?: { src: string; alt: string; source: string };
}

export interface Education {
  institution: string;
  degree: string;
  location: string;
  period: Period;
  /** Optional, shown small. */
  grade?: string;
}

export interface Achievement {
  title: string;
  context: string;
  year?: string;
  icon: string;
  kind: 'award' | 'selection' | 'program' | 'leadership';
  relatedProject?: string;
}

/* ------------------------------------------------------------------ Mindset */

export interface MindsetStep {
  title: string;
  /** One or two words for the label around the Builder's Core. */
  short: string;
  text: string;
  icon: string;
  /** Optional honest example from a real project. */
  example?: { project: string; text: string };
}

/* ----------------------------------------------------------------- Lab */

export const labStatuses = ['Learning', 'Exploring', 'Building', 'Testing', 'Completed', 'Paused'] as const;
export type LabStatus = (typeof labStatuses)[number];

export interface LabEntry {
  slug: string;
  title: string;
  category: string;
  summary: string;
  status: LabStatus;
  started: MonthDate;
  updated: MonthDate;
  /** What I wanted to learn. */
  goal?: string;
  /** What I tried. */
  tried?: string[];
  /** What I discovered. Leave empty until there is something real to say. */
  discovered?: string[];
  /** What I built. */
  built?: string;
  media?: Media[];
  links?: Link[];
  relatedProject?: string;
}

/* ------------------------------------------------------------------ Writing */

export interface Article {
  slug: string;
  title: string;
  summary: string;
  date: MonthDate;
  tags?: string[];
  /** External URL (blog, Medium, LinkedIn article, PDF in /public). */
  href: string;
}

/* --------------------------------------------------------------------- Site */

export interface SectionConfig {
  /** Must match a key in src/sections/registry.tsx */
  id: string;
  label: string;
  /** Show in the main navigation. */
  nav: boolean;
  /** Hide without deleting content. */
  enabled: boolean;
}

export interface SiteConfig {
  /** Public URL without trailing slash, e.g. "https://suryatej.dev". Leave empty until you have one. */
  url: string;
  title: string;
  description: string;
  keywords: string[];
  ogImage: string;
  /** Browser UI colour in the dark theme. */
  themeColor: string;
  /** Browser UI colour in the light theme. */
  themeColorLight: string;
  /** GoatCounter site code (the part before .goatcounter.com). Leave empty for no visitor counting. */
  goatcounter?: string;
  sections: SectionConfig[];
}

/* ---------------------------------------------------------- define helpers */
// These are identity functions that give you autocompletion and type errors in your editor.
export const defineProject = (p: Project) => p;
export const defineLabEntry = (e: LabEntry) => e;
export const defineArticle = (a: Article) => a;
