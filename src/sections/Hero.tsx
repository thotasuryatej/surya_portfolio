import { useEffect, useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { ease } from '../lib/motion';
import { ArrowRight } from 'lucide-react';
import { hero, profile } from '../content';
import { ButtonLink } from '../components/ui/Button';
import { CircuitCore } from '../components/hero/CircuitCore';
import { introDelay } from '../components/layout/Intro';
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

// Entrances wait for the opening card (Intro.tsx) when it plays, so they are seen rather than hidden under it
const rise = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: ease.out, delay: introDelay + delay },
});

/**
 * The name, one letter at a time: each rises and settles in a quick stagger (all done in under a second),
 * and each lifts on its own under the pointer. The outer span takes the hover lift (CSS) so it never
 * fights the entrance transform on the inner one.
 */
function Letters({ text, delay, still }: { text: string; delay: number; still: boolean }) {
  return [...text].map((c, i) => (
    <span key={i} className="hn-ch">
      <motion.span
        className="hn-in"
        initial={still ? false : { y: '0.7em', opacity: 0, rotate: 8 }}
        animate={{ y: '0em', opacity: 1, rotate: 0 }}
        transition={{ duration: 0.7, ease: ease.out, delay: introDelay + delay + i * 0.045 }}
      >
        {c}
      </motion.span>
    </span>
  ));
}

const [first, ...restOfName] = profile.name.split(' ');

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
          <motion.p className="hero-kicker mono" {...rise(0)}>
            <span className="hero-kicker-rule" aria-hidden="true" />
            <span>The Inventor&rsquo;s Lab</span>
          </motion.p>

          <h1 id="hero-title" className="hero-name">
            <span className="sr-only">{profile.name}</span>
            <span className="hero-name-line" aria-hidden="true">
              <Letters text={first} delay={0.05} still={!!reduce} />
            </span>{' '}
            <span className="hero-name-line" aria-hidden="true">
              <Letters text={restOfName.join(' ')} delay={0.05 + first.length * 0.045} still={!!reduce} />
              <motion.span
                className="hero-name-pad"
                initial={reduce ? false : { scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 420, damping: 14, delay: introDelay + 0.65 }}
              />
            </span>
          </h1>

          <motion.p className="hero-role" {...rise(0.28)}>
            {hero.eyebrow.map((e, i) => (
              <span key={e}>
                {i > 0 && <span className="hero-eyebrow-sep" aria-hidden="true">/</span>}
                {e}
              </span>
            ))}
          </motion.p>

          <motion.p className="hero-tagline" {...rise(0.36)}>
            <Title />
          </motion.p>

          {hero.lead && (
            <motion.p className="hero-lead" {...rise(0.42)}>
              {hero.lead}
            </motion.p>
          )}

          <motion.div className="hero-actions" {...rise(0.48)}>
            <ButtonLink variant="primary" href={hero.primaryAction.href} iconEnd={<ArrowRight size={18} className="btn-arrow" aria-hidden="true" />}>
              {hero.primaryAction.label}
            </ButtonLink>
            <ButtonLink variant="glass" href={hero.secondaryAction.href}>
              {hero.secondaryAction.label}
            </ButtonLink>
          </motion.div>

          {hero.now && (
            <motion.p className="hero-now" {...rise(0.54)}>
              <span className="badge-dot is-live" aria-hidden="true" />
              {hero.now}
            </motion.p>
          )}
        </motion.div>

        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: ease.out, delay: introDelay + 0.2 }}
        >
          <motion.div ref={coreRef} style={out ? { scale: coreScale, opacity: coreFade } : undefined}>
            <CircuitCore nodes={hero.nodes} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
