/**
 * Content entry point. UI components import from here, never from individual files.
 *
 * Projects, lab entries and articles are collected automatically from their folders:
 * drop a new file into src/content/projects/ and it appears on the site.
 * Files starting with "_" (templates) are ignored.
 */
import type { Article, LabEntry, Project } from './schema';

export { site } from './site';
export { profile } from './profile';
export { hero } from './hero';
export { about } from './about';
export { capabilities } from './capabilities';
export { jobs, education } from './experience';
export { achievements } from './achievements';
export { mindset, mindsetIntro } from './mindset';
export { journey, journeyPhases, milestoneDate } from './journey';

type Mod<T> = { default: T };

const projectFiles = import.meta.glob<Mod<Project>>(['./projects/*.ts', '!./projects/_*.ts'], { eager: true });
const labFiles = import.meta.glob<Mod<LabEntry>>(['./lab/*.ts', '!./lab/_*.ts'], { eager: true });
const writingFiles = import.meta.glob<Mod<Article>>(['./writing/*.ts', '!./writing/_*.ts'], { eager: true });

const collect = <T>(files: Record<string, Mod<T>>) => Object.values(files).map((m) => m.default);

const startKey = (d: string) => (d === 'present' ? '9999' : d);

/** Featured first, then by `order`, then newest. */
export const projects: Project[] = collect(projectFiles).sort(
  (a, b) =>
    Number(!!b.featured) - Number(!!a.featured) ||
    (a.order ?? 100) - (b.order ?? 100) ||
    startKey(b.period.start).localeCompare(startKey(a.period.start)),
);

/** Most recently updated first. */
export const labEntries: LabEntry[] = collect(labFiles).sort((a, b) => b.updated.localeCompare(a.updated));

/** Newest first. */
export const articles: Article[] = collect(writingFiles).sort((a, b) => b.date.localeCompare(a.date));

export const projectBySlug = (slug: string) => projects.find((p) => p.slug === slug);
