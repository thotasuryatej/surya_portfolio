/**
 * Content paths are written from /public ("/images/x.webp"). Resolve them against the build's base so
 * the same build works at a domain root (suryatejpatel.in) and under a sub-path (user.github.io/repo/).
 */
export function asset(path: string): string;
export function asset(path: string | undefined): string | undefined;
export function asset(path: string | undefined) {
  return path?.startsWith('/') && !path.startsWith('//') ? import.meta.env.BASE_URL + path.slice(1) : path;
}
