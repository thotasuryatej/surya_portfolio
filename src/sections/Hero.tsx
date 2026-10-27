import { useEffect, useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { ease } from '../lib/motion';
import { ArrowRight } from 'lucide-react';
import { hero } from '../content';
import { ButtonLink } from '../components/ui/Button';
import { CircuitCore } from '../components/hero/CircuitCore';
import './hero.css';

function Title() {
  const { title, accent } = hero;
  if (!accent || !title.includes(accent)) return <>{title}</>;
  const [before, after] = title.split(accent);
  return (
    <>
      {before}
      <span className="text-accent">{accent}</span>
      {after}
    </>
  );
}

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: ease.out, delay },
});

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  // Scroll-out: as the hero leaves, the copy drifts up and fades while the core recedes
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  // The core tracks its own exit, not the hero's: on phones it sits below the copy and would otherwise
  // have faded before it reaches the screen
  const coreRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: coreOut } = useScroll({ target: coreRef, offset: ['start start', 'end start'] });
  const coreFade = useTransform(coreOut, [0.3, 0.95], [1, 0]);
  const coreScale = useTransform(coreOut, [0, 1], [1, 0.88]);
  const out = !reduce;

  // Pointer parallax for the core (fine pointers, motion allowed)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!matchMedia('(pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const core = el.querySelector<HTMLElement>('.core');
    let frame = 0;
    const move = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        core?.style.setProperty('--px', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
        core?.style.setProperty('--py', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
      });
    };
    el.addEventListener('pointermove', move);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener('pointermove', move);
    };
  }, []);

  return (
    <section id="home" ref={ref} className="hero" aria-labelledby="hero-title">
      <div className="container hero-grid">
        <motion.div className="hero-copy" style={out ? { y: copyY, opacity: fade } : undefined}>
          <motion.p className="hero-eyebrow" {...rise(0.05)}>
            {hero.eyebrow.map((e, i) => (
              <span key={e}>
                {i > 0 && <span className="hero-eyebrow-sep" aria-hidden="true">·</span>}
                {e}
              </span>
            ))}
          </motion.p>

          <motion.h1 id="hero-title" className="hero-title" {...rise(0.12)}>
            <Title />
          </motion.h1>

          <motion.p className="hero-lead" {...rise(0.2)}>
            {hero.lead}
          </motion.p>

          <motion.div className="hero-actions" {...rise(0.28)}>
            <ButtonLink variant="primary" href={hero.primaryAction.href} iconEnd={<ArrowRight size={18} className="btn-arrow" aria-hidden="true" />}>
              {hero.primaryAction.label}
            </ButtonLink>
            <ButtonLink variant="glass" href={hero.secondaryAction.href}>
              {hero.secondaryAction.label}
            </ButtonLink>
          </motion.div>

          {hero.now && (
            <motion.p className="hero-now" {...rise(0.36)}>
              <span className="badge-dot is-live" aria-hidden="true" />
              {hero.now}
            </motion.p>
          )}
        </motion.div>

        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: ease.out, delay: 0.1 }}
        >
          <motion.div ref={coreRef} style={out ? { scale: coreScale, opacity: coreFade } : undefined}>
            <CircuitCore nodes={hero.nodes} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
