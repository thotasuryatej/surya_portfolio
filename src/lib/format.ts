import type { DateOrPresent, Period } from '../content/schema';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2025-09" → "Sep 2025", "2025" → "2025", "present" → "Present" */
export function formatDate(d: DateOrPresent): string {
  if (d === 'present') return 'Present';
  const [y, m] = d.split('-');
  return m ? `${MONTHS[Number(m) - 1]} ${y}` : y;
}

export function formatPeriod(p: Period): string {
  if (!p.end) return formatDate(p.start);
  return `${formatDate(p.start)} – ${formatDate(p.end)}`;
}
