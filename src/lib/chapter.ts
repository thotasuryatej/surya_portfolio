import { createContext, useContext } from 'react';

/** A section's position on the page (the hero is 0). Section eyebrows show it as a chapter number. */
export const ChapterContext = createContext<number | undefined>(undefined);

/** "01", "02"… for the current section, or nothing outside a numbered section. */
export function useChapter() {
  const n = useContext(ChapterContext);
  return n ? String(n).padStart(2, '0') : undefined;
}
