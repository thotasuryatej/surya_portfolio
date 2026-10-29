/*
 * Liquid glass: the backdrop is bent at the rim of a plate, each colour channel by a slightly different
 * amount, so the edge refracts what scrolls under it with a faint chromatic fringe.
 *
 * Adapted from the SVG filter path of GlassSurface in React Bits (https://github.com/DavidHDev/react-bits),
 * trimmed to the displacement filter only (no WebGL path).
 * Copyright (c) 2026 David Haz. Licensed under the MIT License with the Commons Clause: the above copyright
 * notice and this permission notice shall be included in all copies or substantial portions of the Software.
 */
import { useEffect, useId, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';

interface Options {
  /** Off for elements that should stay plain glass */
  enabled?: boolean;
  /** Corner radius of the plate in px; read from the element's CSS when left out */
  radius?: number;
  /** Depth of the bent rim, as a fraction of the plate's shorter side */
  border?: number;
  /** How far the rim pulls the backdrop (negative bends inward) */
  scale?: number;
  /** How far apart the colour channels bend, in px per channel: the width of the fringe */
  chroma?: number;
}

/**
 * Chromium alone applies an SVG filter as a backdrop-filter; Safari and Firefox accept the syntax but draw
 * nothing, so they are ruled out by name before the syntax test. That includes every browser on iPhone and
 * iPad, which all run WebKit (Chrome there says CriOS, not Chrome); they keep the plain blur.
 */
function supported(id: string) {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent;
  if ((/Safari/.test(ua) && !/Chrome/.test(ua)) || /Firefox/.test(ua)) return false;
  const probe = document.createElement('div');
  probe.style.backdropFilter = `url(#${id})`;
  return probe.style.backdropFilter !== '';
}

/** The displacement map: red ramps across, blue ramps down, and a blurred grey slab keeps the middle still. */
function map(w: number, h: number, radius: number, border: number) {
  const edge = Math.min(w, h) * border * 0.5;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<defs>
<linearGradient id="r" x1="100%" y1="0%" x2="0%" y2="0%"><stop offset="0%" stop-color="#0000"/><stop offset="100%" stop-color="red"/></linearGradient>
<linearGradient id="b" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#0000"/><stop offset="100%" stop-color="blue"/></linearGradient>
<filter id="s" filterUnits="userSpaceOnUse" x="0" y="0" width="${w}" height="${h}" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="${Math.max(4, edge * 0.9)}"/></filter>
</defs>
<rect width="${w}" height="${h}" fill="black"/>
<rect width="${w}" height="${h}" rx="${radius}" fill="url(#r)"/>
<rect width="${w}" height="${h}" rx="${radius}" fill="url(#b)" style="mix-blend-mode:difference"/>
<rect x="${edge}" y="${edge}" width="${w - edge * 2}" height="${h - edge * 2}" rx="${radius}" fill="hsl(0 0% 50% / 0.93)" filter="url(#s)"/>
</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * Gives `ref`'s element a liquid glass backdrop where the browser can draw one. The element gets
 * `data-liquid` and a `--liquid` filter value for its CSS to use (glass.css); elsewhere it keeps its plain blur.
 * Returns the filter, portalled to the end of the page; render it anywhere in the component.
 */
export function useLiquidGlass<T extends HTMLElement>(
  ref: RefObject<T | null>,
  { enabled = true, radius, border = 0.14, scale = -60, chroma = 3 }: Options = {},
) {
  const id = `lg${useId().replace(/[^\w-]/g, '')}`;
  const [href, setHref] = useState('');

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled || !supported(id)) return;
    let w = 0;
    let h = 0;
    const ro = new ResizeObserver(([entry]) => {
      const box = entry.borderBoxSize?.[0];
      const nw = Math.round(box ? box.inlineSize : el.offsetWidth);
      const nh = Math.round(box ? box.blockSize : el.offsetHeight);
      if (!nw || !nh || (nw === w && nh === h)) return;
      w = nw;
      h = nh;
      const r = radius ?? (parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0);
      setHref(map(w, h, Math.min(r, w / 2, h / 2), border));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, id, enabled, radius, border]);

  // Switch the element over only once its filter is in the page, so it never points at a missing one.
  // Re-run on `enabled` too: an element that unmounts and returns (an open dialog's panel) is a new node.
  const ready = !!href;
  useEffect(() => {
    const el = ref.current;
    if (!el || !ready || !enabled) return;
    el.style.setProperty('--liquid', `url(#${id})`);
    el.setAttribute('data-liquid', '');
    return () => {
      el.removeAttribute('data-liquid');
      el.style.removeProperty('--liquid');
    };
  }, [ref, id, ready, enabled]);

  const channel = (offset: number, matrix: string, name: string) => (
    <>
      <feDisplacementMap in="SourceGraphic" in2="map" scale={scale + offset} xChannelSelector="R" yChannelSelector="B" result={`d${name}`} />
      <feColorMatrix in={`d${name}`} type="matrix" values={matrix} result={name} />
    </>
  );

  return href
    ? createPortal(
        <svg className="lg-defs" width="0" height="0" aria-hidden="true" focusable="false">
          <filter id={id} colorInterpolationFilters="sRGB" x="0%" y="0%" width="100%" height="100%">
            <feImage href={href} x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map" />
            {channel(0, '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0', 'red')}
            {channel(chroma, '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0', 'green')}
            {channel(chroma * 2, '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0', 'blue')}
            <feBlend in="red" in2="green" mode="screen" result="rg" />
            <feBlend in="rg" in2="blue" mode="screen" result="out" />
            <feGaussianBlur in="out" stdDeviation="0.7" />
          </filter>
        </svg>,
        document.body,
      )
    : null;
}
