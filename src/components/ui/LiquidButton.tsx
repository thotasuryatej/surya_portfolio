import { useRef, type ComponentProps } from 'react';
import { useLiquidGlass } from './LiquidGlass';

/**
 * A button that becomes a liquid glass plate where the browser can draw one (the element gets `data-liquid`
 * for its CSS to style). Takes a ref like any button. `scale` is how hard the rim bends and `chroma` how wide
 * its colour fringe is; both want to be gentler for small tags.
 */
export function LiquidButton({
  ref,
  scale,
  chroma,
  type = 'button',
  ...rest
}: ComponentProps<'button'> & { scale?: number; chroma?: number }) {
  const own = useRef<HTMLButtonElement>(null);
  const liquid = useLiquidGlass(own, { scale, chroma });
  const setRef = (el: HTMLButtonElement | null) => {
    own.current = el;
    if (typeof ref === 'function') ref(el);
    else if (ref) ref.current = el;
  };
  return (
    <>
      {liquid}
      <button ref={setRef} type={type} {...rest} />
    </>
  );
}
