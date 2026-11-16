/**
 * Geometry of the ST logo (polished copper ST): one stroke that draws the S and runs on into the T.
 * Units: a 512 x 512 artboard; the letters are drawn as a 42-wide stroke, with a copper extrusion down and
 * to the right. ST_VIEW is the exact box of the letters and their extrusion (x 84-445.3, y 119-414.1), so
 * centring ST_VIEW centres what you see.
 */
export const ST_PATH = 'M84 356H214A54 54 0 0 0 214 248H170A54 54 0 0 1 170 140H428M332 140V392';
export const ST_STROKE = 42;
export const ST_VIEW = { x: 84, y: 119, w: 361.3, h: 295.1 };
/** The extrusion: steps from the face back, and the offset of the deepest step. */
export const ST_DEPTH = { dx: 17.3, dy: 22.1 };
/** Copper face: polished bands, highlight to shadow, along the diagonal. */
export const ST_BAND_STOPS = [0, 0.16, 0.34, 0.5, 0.62, 0.8, 1];
/** Extrusion side colours: near the face, and at the back. */
export const ST_SIDE = [
  [168, 74, 34],
  [60, 22, 8],
] as const;
