import type { Evidence, LabStatus, ProjectStatus } from '../content/schema';

export const projectStatusColor: Record<ProjectStatus, string> = {
  'In progress': 'var(--cyan)',
  Deployed: 'var(--green)',
  Completed: 'var(--green)',
  Prototype: 'var(--violet)',
  Research: 'var(--violet)',
  Academic: 'var(--text-2)',
  Concept: 'var(--amber)',
};

export const labStatusColor: Record<LabStatus, string> = {
  Learning: 'var(--rose)',
  Exploring: 'var(--amber)',
  Building: 'var(--cyan)',
  Testing: 'var(--violet)',
  Completed: 'var(--green)',
  Paused: 'var(--text-3)',
};

export const evidenceLabel: Record<Evidence, string> = {
  professional: 'Professional work',
  academic: 'Academic project',
  exploring: 'Exploring',
};

export const evidenceColor: Record<Evidence, string> = {
  professional: 'var(--ev-professional)',
  academic: 'var(--ev-academic)',
  exploring: 'var(--ev-exploring)',
};
