/** The nav island (Nav.tsx) listens for this event and shows its text for a moment. */
export const ISLAND_EVENT = 'island:notice';

export const notify = (text: string) => window.dispatchEvent(new CustomEvent(ISLAND_EVENT, { detail: text }));
