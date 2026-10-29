/**
 * Runtime checks that TypeScript cannot do: unique slugs, valid dates, links that
 * point at real projects, and media files that exist. Run with `npm run validate`
 * (also runs automatically before `npm run build`).
 */
import * as content from './index';
import { iconNames } from '../components/ui/iconNames';
import { visualKeys, diagramKeys } from '../components/visuals/keys';
import { projectStatuses, labStatuses } from './schema';

export interface Issue {
  level: 'error' | 'warning';
  where: string;
  message: string;
}

const DATE = /^\d{4}(-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?)?$/;
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function validateContent(fileExists: (publicPath: string) => boolean): Issue[] {
  const issues: Issue[] = [];
  const err = (where: string, message: string) => issues.push({ level: 'error', where, message });
  const warn = (where: string, message: string) => issues.push({ level: 'warning', where, message });

  const checkDate = (where: string, field: string, value: string | undefined, allowPresent = false) => {
    if (value === undefined) return;
    if (allowPresent && value === 'present') return;
    if (!DATE.test(value)) err(where, `${field} "${value}" must look like 2025, 2025-09 or 2025-09-14`);
  };
  const checkIcon = (where: string, name: string) => {
    if (!iconNames.includes(name)) warn(where, `icon "${name}" is not in src/components/ui/iconNames.ts — a default icon will be shown`);
  };
  const checkAsset = (where: string, src: string | undefined) => {
    if (!src) return;
    if (/^https?:\/\//.test(src)) return;
    if (!src.startsWith('/')) err(where, `media path "${src}" must start with "/" (relative to /public)`);
    else if (!fileExists(src)) err(where, `file not found: public${src}`);
  };
  const checkLink = (where: string, href: string) => {
    if (/^(https?:|mailto:|tel:)/.test(href)) return;
    if (href.startsWith('/')) return checkAsset(where, href);
    err(where, `link "${href}" should be a full URL (https://...) or a /public path`);
  };

  const slugs = new Set<string>();
  const projectSlugs = new Set(content.projects.map((p) => p.slug));

  // Projects
  let featured = 0;
  for (const p of content.projects) {
    const where = `projects/${p.slug}`;
    if (!SLUG.test(p.slug)) err(where, 'slug must be lowercase-with-dashes');
    if (slugs.has(p.slug)) err(where, 'duplicate slug');
    slugs.add(p.slug);
    for (const f of ['title', 'category', 'summary'] as const) if (!p[f]?.trim()) err(where, `${f} is empty`);
    if (!(projectStatuses as readonly string[]).includes(p.status)) err(where, `unknown status "${p.status}". Options: ${projectStatuses.join(', ')}`);
    if (!p.overview?.length) err(where, 'overview needs at least one paragraph');
    if (!p.technologies?.length) warn(where, 'no technologies listed');
    checkDate(where, 'period.start', p.period.start);
    checkDate(where, 'period.end', p.period.end, true);
    checkDate(where, 'updated', p.updated);
    if (p.visual && !(visualKeys as readonly string[]).includes(p.visual)) err(where, `unknown visual "${p.visual}". Options: ${visualKeys.join(', ')}`);
    for (const d of [p.diagram ?? []].flat())
      if (!(diagramKeys as readonly string[]).includes(d)) err(where, `unknown diagram "${d}". Options: ${diagramKeys.join(', ')}`);
    if (p.featured) featured++;
    for (const m of [...(p.media ?? []), ...(p.cover ? [p.cover] : [])]) {
      checkAsset(where, m.src);
      checkAsset(where, m.poster);
      if (!m.alt?.trim()) err(where, `media "${m.src}" needs alt text`);
    }
    for (const l of p.links ?? []) checkLink(where, l.href);
    if (p.summary.length > 220) warn(where, `summary is ${p.summary.length} characters — cards read best under ~200`);
  }
  if (featured > 1) warn('projects', `${featured} projects are featured — only the first will get the large card`);

  // Lab
  const labSlugs = new Set<string>();
  for (const e of content.labEntries) {
    const where = `lab/${e.slug}`;
    if (!SLUG.test(e.slug)) err(where, 'slug must be lowercase-with-dashes');
    if (labSlugs.has(e.slug)) err(where, 'duplicate slug');
    labSlugs.add(e.slug);
    if (!(labStatuses as readonly string[]).includes(e.status)) err(where, `unknown status "${e.status}". Options: ${labStatuses.join(', ')}`);
    checkDate(where, 'started', e.started);
    checkDate(where, 'updated', e.updated);
    if (e.updated < e.started) warn(where, 'updated is earlier than started');
    if (e.relatedProject && !projectSlugs.has(e.relatedProject)) err(where, `relatedProject "${e.relatedProject}" does not exist`);
    for (const m of e.media ?? []) {
      checkAsset(where, m.src);
      if (!m.alt?.trim()) err(where, `media "${m.src}" needs alt text`);
    }
    for (const l of e.links ?? []) checkLink(where, l.href);
  }

  // Writing
  for (const a of content.articles) {
    const where = `writing/${a.slug}`;
    checkDate(where, 'date', a.date);
    checkLink(where, a.href);
  }

  // Cross references
  for (const c of content.capabilities) {
    checkIcon(`capabilities/${c.id}`, c.icon);
    for (const s of c.relatedProjects ?? [])
      if (!projectSlugs.has(s)) err(`capabilities/${c.id}`, `relatedProjects "${s}" does not exist`);
  }
  for (const a of content.achievements) {
    checkIcon(`achievements/${a.title}`, a.icon);
    if (a.relatedProject && !projectSlugs.has(a.relatedProject))
      err(`achievements/${a.title}`, `relatedProject "${a.relatedProject}" does not exist`);
  }
  for (const s of content.mindset) {
    checkIcon(`mindset/${s.title}`, s.icon);
    if (s.example && !projectSlugs.has(s.example.project))
      err(`mindset/${s.title}`, `example.project "${s.example.project}" does not exist`);
  }
  for (const n of content.hero.nodes) checkIcon(`hero/${n.id}`, n.icon);
  if (content.hero.nodes.length > 8) warn('hero', 'more than 8 nodes will crowd the hero visual');
  for (const g of content.about.glance) checkIcon(`about/${g.label}`, g.icon);
  const phaseIds = content.journeyPhases.map((p) => p.id);
  const seenPhases: string[] = [];
  for (const m of content.journey) {
    const where = `journey/${m.title}`;
    if (!phaseIds.includes(m.phase)) err(where, `phase "${m.phase}" is not in journeyPhases`);
    else if (seenPhases.at(-1) !== m.phase) {
      if (seenPhases.includes(m.phase)) err(where, `stops of phase "${m.phase}" must sit together`);
      seenPhases.push(m.phase);
    }
    checkIcon(where, m.icon);
    if (m.project && !projectSlugs.has(m.project)) err(where, `project "${m.project}" does not exist`);
    if (m.logo) checkAsset(where, m.logo.src);
  }

  // Experience
  for (const j of content.jobs) {
    checkDate(`experience/${j.company}`, 'period.start', j.period.start);
    checkDate(`experience/${j.company}`, 'period.end', j.period.end, true);
    if (j.logo) {
      checkAsset(`experience/${j.company}`, j.logo.src);
      if (!j.logo.alt.trim()) err(`experience/${j.company}`, 'logo needs alt text');
      if (!/^https:\/\//.test(j.logo.source)) err(`experience/${j.company}`, 'logo.source should be the official URL the logo came from');
    }
  }

  // Profile
  checkAsset('profile.resume', content.profile.resume.file);
  if (content.profile.portrait) {
    checkAsset('profile.portrait', content.profile.portrait.src);
    if (!content.profile.portrait.alt.trim()) err('profile.portrait', 'portrait needs alt text');
    if (content.profile.portrait.placeholder) warn('profile.portrait', 'still using the placeholder portrait — see CONTENT_GUIDE.md › Portrait');
  }
  checkDate('profile.resume', 'updated', content.profile.resume.updated);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(content.profile.email)) err('profile', 'email looks invalid');
  for (const s of content.profile.socials) checkLink(`profile.socials/${s.label}`, s.href);

  // Sections
  const ids = content.site.sections.map((s) => s.id);
  if (new Set(ids).size !== ids.length) err('site.sections', 'duplicate section id');
  if (content.site.url && content.site.url.endsWith('/')) warn('site.url', 'remove the trailing slash');

  return issues;
}
