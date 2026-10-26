import { useEffect, type RefObject } from 'react';

const finePointer = () => typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches;
const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Writes the pointer position into --mx / --my on the element (as %), so CSS can
 * draw a specular highlight that follows the cursor. No React re-renders.
 */
export function usePointerLight(ref: RefObject<HTMLElement | null>, enabled = true) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled || !finePointer()) return;
    let frame = 0;
    const move = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
        el.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
      });
    };
    const enter = () => el.classList.add('is-lit');
    const leave = () => el.classList.remove('is-lit');
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerenter', enter);
    el.addEventListener('pointerleave', leave);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerenter', enter);
      el.removeEventListener('pointerleave', leave);
    };
  }, [ref, enabled]);
}

/** Pulls the element slightly toward the pointer (a few px). Fine pointers only. */
export function useMagnetic(ref: RefObject<HTMLElement | null>, enabled = true, strength = 0.18) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled || !finePointer() || reducedMotion()) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) * strength;
      const y = (e.clientY - (r.top + r.height / 2)) * strength;
      el.style.setProperty('--mag-x', `${x.toFixed(1)}px`);
      el.style.setProperty('--mag-y', `${y.toFixed(1)}px`);
      el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
    };
    const leave = () => {
      el.style.setProperty('--mag-x', '0px');
      el.style.setProperty('--mag-y', '0px');
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, [ref, enabled, strength]);
}
