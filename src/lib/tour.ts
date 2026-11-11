/** The tour (components/tour/Tour.tsx) starts on this event; any button on the page can send it. */
export const TOUR_START = 'tour:start';
/** The tour asks the projects gallery to turn to a project: `detail` is its slug. */
export const TOUR_PROJECT = 'tour:project';

export const startTour = () => window.dispatchEvent(new Event(TOUR_START));
export const showProject = (slug: string) => window.dispatchEvent(new CustomEvent(TOUR_PROJECT, { detail: slug }));
