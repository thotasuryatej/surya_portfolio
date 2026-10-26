import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { profile } from '../../content';
import './portrait-boot.css';

/**
 * The portrait as a small display on a board: as it scrolls into view, the screen "boots" —
 * a scan line sweeps down, revealing the photo, then the status LED turns on.
 * Scroll-linked, transform/clip-path only. Reduced motion shows it fully on.
 * To use a real photo: replace public/images/surya-tej-portrait.webp and set `placeholder: false` in profile.ts.
 */
export function PortraitBoot({ role }: { role: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const still = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.95', 'center 0.55'] });
  const clip = useTransform(scrollYProgress, (p) => `inset(0 0 ${((1 - p) * 100).toFixed(2)}% 0 round 14px)`);
  const scale = useTransform(scrollYProgress, [0, 1], [1.12, 1]);
  const scanY = useTransform(scrollYProgress, (p) => `${(p * 100).toFixed(2)}%`);
  const scanO = useTransform(scrollYProgress, [0, 0.05, 0.9, 1], [0, 1, 1, 0]);
  const led = useTransform(scrollYProgress, [0.92, 1], [0, 1]);
  const p = profile.portrait;
  if (!p) return null;

  return (
    <figure className="pb" ref={ref}>
      <div className="pb-board glass">
        <span className="pb-pins pb-pins--l" aria-hidden="true" />
        <span className="pb-pins pb-pins--r" aria-hidden="true" />
        <div className="pb-screen">
          <span className="pb-off" aria-hidden="true">
            <span className="mono">BOOTING…</span>
          </span>
          <motion.div className="pb-img" style={still ? undefined : { clipPath: clip }}>
            <motion.img
              src={p.src}
              alt={p.alt}
              width={1000}
              height={1250}
              loading="lazy"
              decoding="async"
              style={still ? undefined : { scale }}
            />
          </motion.div>
          {!still && <motion.span className="pb-scan" aria-hidden="true" style={{ top: scanY, opacity: scanO }} />}
        </div>
        <div className="pb-bar mono" aria-hidden="true">
          <motion.span className="pb-led" style={still ? { opacity: 1 } : { opacity: led }} />
          <span>ST-01</span>
          <span className="pb-bar-sep" />
          <span>{p.placeholder ? 'PHOTO PENDING' : 'ONLINE'}</span>
        </div>
      </div>
      <figcaption className="pb-cap">
        <strong>{profile.name}</strong>
        <span>{role}</span>
        <span className="pb-loc mono">{profile.location}</span>
      </figcaption>
    </figure>
  );
}
