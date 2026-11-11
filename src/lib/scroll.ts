/** Whether a pinned section lies between the current scroll position and `el`. */
export const crossesPin = (el: Element) => {
  const to = el.getBoundingClientRect().top;
  const [lo, hi] = to < 0 ? [to, 0] : [0, to];
  return [...document.querySelectorAll('.section--pinned')].some((pin) => {
    const r = pin.getBoundingClientRect();
    return pin !== el && r.top < hi && r.bottom > lo;
  });
};
