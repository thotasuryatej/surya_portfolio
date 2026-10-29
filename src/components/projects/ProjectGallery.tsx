import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent, type ReactNode } from 'react';
import { animate, useInView, useMotionValue, useMotionValueEvent, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Award } from 'lucide-react';
import type { Project } from '../../content/schema';
import { Badge, TagList } from '../ui/Badge';
import { formatPeriod } from '../../lib/format';
import { projectStatusColor } from '../../lib/status';
import { useProjectRoute } from '../../hooks/useProjectRoute';
import { useLiquidGlass } from '../ui/LiquidGlass';
import { ProjectMedia, useCursorLabel } from './ProjectCard';

/*
 * The fan: the centre card full size, its neighbours tipped out behind it, and past the second step a card
 * becomes a faint outline that fades away. One step of `pos` is one card. Values follow the drag-gallery spec.
 */
const ROTATE = 5; // degrees per step
const SPREAD = 0.5; // sideways step, as a share of the card width (the spec's 0.42 hid too much of landscape cards)
const SHRINK = 0.22; // scale lost per step
const SHADE = 0.5; // darkening at two steps out
const OUTLINE = 0.32; // strongest outline opacity, at three steps out

const nn = (n: number) => String(n).padStart(2, '0');
const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const easeOut = (t: number) => 1 - (1 - t) ** 3;
const SNAP = { type: 'spring', stiffness: 280, damping: 34, mass: 0.9 } as const;

/** Cards share the illustrations' shape (400 × 250), so nothing is cropped */
const ASPECT = 250 / 400;
/** Space kept under the pinned details, in px */
const PIN_FOOT = 20;

/** Card width for the stage width: most of the screen on phones, smaller on desktops. When pinned, `room` is the
    height left for the stage once the top bar, heading, names and details have theirs, so everything fits one screen. */
const cardWidth = (w: number, room?: number) => {
  const wide = clamp(w * (w < 600 ? 0.7 : w < 1000 ? 0.46 : 0.27), 220, 380);
  return room === undefined ? wide : clamp(room / (ASPECT * 1.16), 200, wide);
};

/** Height the pinned screen leaves for the stage: everything around it is measured, not guessed */
const pinRoom = (stage: HTMLElement) => {
  const pin = stage.closest<HTMLElement>('.pin-stage');
  if (!pin?.firstElementChild || !pin.lastElementChild) return undefined;
  const top = pin.firstElementChild.getBoundingClientRect().top;
  const bottom = pin.lastElementChild.getBoundingClientRect().bottom;
  const rest = bottom - top - stage.offsetHeight + parseFloat(getComputedStyle(pin).paddingTop) + PIN_FOOT;
  return pin.clientHeight - rest;
};

/**
 * Projects as a fan of cards (after the drag-gallery spec), with the details of the centre one below.
 * Drag or swipe sideways, use the arrows, the ← → keys or the row of names; sideways trackpad scrolling works too.
 * It stops at the first and last project rather than looping, so the count means something.
 * `steer`: on desktops the section pins and scrolling the page turns the fan a project at a time
 * (useScrollSteps); every other way of choosing a project then scrolls the page to it, so the two agree.
 * `from`: the project shown first (the last one, once the pinned version has been scrolled past).
 */
export function ProjectGallery({ projects, steer, from = 0 }: { projects: Project[]; steer?: { step: number; goTo: (i: number) => void }; from?: number }) {
  const still = useReducedMotion();
  const n = projects.length;
  const pos = useMotionValue(from);
  // Coming back up to it after the pin, the fan is already open
  const enter = useMotionValue(still || from > 0 ? 1 : 0);
  const [active, setActive] = useState(from);
  const [cw, setCw] = useState(400);
  const [phone, setPhone] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const glide = useRef<ReturnType<typeof animate>>(null);
  const seen = useInView(stage, { once: true, amount: 0.35 });

  useMotionValueEvent(pos, 'change', (p) => setActive(clamp(Math.round(p), 0, n - 1)));

  // A filter can shrink the list under the current card
  useEffect(() => {
    if (pos.get() > n - 1) pos.set(Math.max(0, n - 1));
  }, [n, pos]);

  const sized = !!steer;
  useLayoutEffect(() => {
    const el = stage.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      setCw(Math.round(cardWidth(w, sized ? pinRoom(el) : undefined)));
      setPhone(w < 600);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      removeEventListener('resize', measure);
    };
  }, [sized]);

  // The cards fan out from a stack the first time the section comes into view
  useEffect(() => {
    if (!seen || still) return;
    const a = animate(enter, 1, { duration: 1.3, ease: 'linear' });
    return () => a.stop();
  }, [seen, still, enter]);

  // Lay out every card from `pos` (and the entrance), straight onto the elements: no React render per frame
  useLayoutEffect(() => {
    const layout = () => {
      const p = pos.get();
      const E = enter.get();
      cards.current.forEach((el, i) => {
        if (!el) return;
        const d = i - p;
        const a = Math.abs(d);
        const e = easeOut(clamp((E - Math.min(a, 3) * 0.12) / 0.64));
        const scale = Math.max(0.4, 1 - a * SHRINK);
        const s = 0.3 + (scale - 0.3) * e;
        const x = d * cw * SPREAD * e;
        const y = Math.min(a, 3) * cw * 0.03 * e;
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${(d * ROTATE * e).toFixed(2)}deg) scale(${s.toFixed(4)})`;
        // Past two steps the picture gives way to an outline; phones and the entrance skip the outlines
        const ghost = clamp(a - 2);
        const outline = phone || E < 1 ? 0 : a <= 3 ? ghost * OUTLINE : clamp(4 - a) * OUTLINE;
        const face = 1 - ghost;
        el.style.opacity = e.toFixed(3);
        el.style.visibility = e > 0.001 && (face > 0.001 || outline > 0.001) ? '' : 'hidden';
        el.style.zIndex = String(Math.round(100 - a * 10));
        el.style.setProperty('--face', face.toFixed(3));
        el.style.setProperty('--outline', outline.toFixed(3));
        el.style.setProperty('--shade', (Math.min(a, 2) * (SHADE / 2)).toFixed(3));
        el.style.setProperty('--ring', clamp(1 - a * 2.5).toFixed(3));
        el.style.pointerEvents = a < 2.5 ? '' : 'none';
      });
    };
    layout();
    const offPos = pos.on('change', layout);
    const offEnter = enter.on('change', layout);
    return () => {
      offPos();
      offEnter();
    };
  }, [pos, enter, cw, phone, n]);

  const turn = (to: number, velocity = 0) => {
    const target = clamp(Math.round(to), 0, n - 1);
    glide.current?.stop();
    if (still) {
      pos.set(target);
      return;
    }
    glide.current = animate(pos, target, { ...SNAP, velocity });
  };
  // Pinned, choosing a project scrolls the page to its stretch of the pin, and the scroll turns the fan
  const go = (to: number, velocity = 0) => {
    if (!steer) return turn(to, velocity);
    const target = clamp(Math.round(to), 0, n - 1);
    if (target === steer.step) turn(target, velocity);
    else steer.goTo(target);
  };
  const step = steer?.step;
  useEffect(() => {
    if (step !== undefined) turn(step);
  }, [step]);

  /*
   * Drag. `touch-action: pan-y` on the stage leaves vertical swipes to the browser (it cancels the pointer
   * when the page scrolls), so a sideways swipe reaches here and an up-or-down one scrolls the page.
   */
  const drag = useRef<{ id: number; x: number; from: number; moved: boolean; t: number; lastX: number; v: number } | null>(null);
  const dragged = useRef(false);
  const unit = cw * SPREAD * 1.25; // pixels of drag per card
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || n < 2) return;
    drag.current = { id: e.pointerId, x: e.clientX, from: pos.get(), moved: false, t: e.timeStamp, lastX: e.clientX, v: 0 };
    dragged.current = false;
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const g = drag.current;
    if (!g || g.id !== e.pointerId) return;
    const dx = e.clientX - g.x;
    if (!g.moved) {
      if (Math.abs(dx) < 6) return;
      g.moved = true;
      dragged.current = true;
      glide.current?.stop();
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    // Past either end the fan gives, like a rubber band, then springs back
    const raw = g.from - dx / unit;
    const over = raw < 0 ? raw : raw > n - 1 ? raw - (n - 1) : 0;
    pos.set(raw - over + over * 0.3);
    const dt = Math.max(1, e.timeStamp - g.t);
    g.v = 0.7 * ((-(e.clientX - g.lastX) / unit) * (1000 / dt)) + 0.3 * g.v;
    g.t = e.timeStamp;
    g.lastX = e.clientX;
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const g = drag.current;
    drag.current = null;
    if (!g || g.id !== e.pointerId || !g.moved) return;
    // A flick carries on a little before it settles
    const v = e.timeStamp - g.t > 80 ? 0 : clamp(g.v, -12, 12);
    go(pos.get() + v * 0.16, v);
  };
  const onPointerCancel = () => {
    if (drag.current?.moved) go(pos.get());
    drag.current = null;
  };
  // A drag that ends on a card isn't a click on it
  const onClickCapture = (e: MouseEvent) => {
    if (!dragged.current) return;
    e.stopPropagation();
    e.preventDefault();
    dragged.current = false;
  };

  // Sideways trackpad scrolling steps through; ordinary vertical wheel scrolling is left to the page
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    let acc = 0;
    let lock = 0;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < 2) return;
      e.preventDefault();
      if (e.timeStamp < lock) return;
      acc += e.deltaX;
      if (Math.abs(acc) > 40) {
        const step = Math.sign(acc);
        acc = 0;
        lock = e.timeStamp + 420;
        go(Math.round(pos.get()) + step);
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  });

  const onKeyDown = (e: KeyboardEvent) => {
    const to = { ArrowLeft: active - 1, ArrowRight: active + 1, Home: 0, End: n - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    go(to);
  };

  const { open } = useProjectRoute();
  const project = projects[active];
  if (!project) return null;

  return (
    <div className={`pg${steer ? ' pg--pinned' : ''}`} data-in={seen || undefined} aria-roledescription="carousel" aria-label="Projects" role="region" onKeyDown={onKeyDown}>
      <div
        ref={stage}
        className="pg-stage"
        style={{ ['--cw' as string]: `${cw}px` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onClickCapture={onClickCapture}
        aria-hidden="true"
      >
        {projects.map((p, i) => (
          <Card
            key={p.slug}
            project={p}
            centre={i === active}
            setRef={(el) => (cards.current[i] = el)}
            onClick={() => (i === active ? open(p.slug) : go(i))}
          />
        ))}
      </div>

      {/* Pinned, the names sit between the arrows on one row, which leaves the cards more of the screen */}
      <div className="container pg-nav">
        <Step onClick={() => go(active - 1)} disabled={active === 0} label="Previous project">
          <ArrowLeft size={18} aria-hidden="true" />
        </Step>
        {steer ? (
          <Names projects={projects} active={active} onPick={go} />
        ) : (
          <p className="pg-count mono" aria-hidden="true">
            <span>{nn(active + 1)}</span> / {nn(n)}
          </p>
        )}
        <Step onClick={() => go(active + 1)} disabled={active === n - 1} label="Next project">
          <ArrowRight size={18} aria-hidden="true" />
        </Step>
      </div>

      {!steer && <Names projects={projects} active={active} onPick={go} />}

      <div className="container">
        <Detail key={project.slug} project={project} index={active} total={n} />
      </div>
    </div>
  );
}

/** One card of the fan. Only the centre one opens its case study; a side card is brought to the centre. */
function Card({ project, centre, setRef, onClick }: { project: Project; centre: boolean; setRef: (el: HTMLDivElement | null) => void; onClick: () => void }) {
  const cursor = useCursorLabel();
  const pill = useRef<HTMLSpanElement>(null);
  const liquid = useLiquidGlass(pill, { enabled: centre });
  return (
    <div ref={setRef} className="pg-card" data-centre={centre || undefined} onClick={onClick}>
      <div
        ref={cursor.ref}
        className="pg-face"
        onPointerMove={centre ? cursor.onPointerMove : undefined}
        onPointerLeave={cursor.onPointerLeave}
      >
        <div className="pg-media">
          <ProjectMedia project={project} />
        </div>
        <span className="pg-shade" />
        <span className="ps-glare" />
        {liquid}
        {centre && (
          <span ref={pill} className="ps-cursor">
            Read the case study <ArrowUpRight size={15} />
          </span>
        )}
      </div>
      <span className="pg-ring" />
      <span className="pg-outline" />
    </div>
  );
}

/** The row of short names: every project at a glance, and a jump to any of them. Scrolls sideways on phones. */
function Names({ projects, active, onPick }: { projects: Project[]; active: number; onPick: (i: number) => void }) {
  const row = useRef<HTMLDivElement>(null);
  // Keep the current name in view without scrolling the page itself
  useEffect(() => {
    const r = row.current;
    const b = r?.children[active] as HTMLElement | undefined;
    if (!r || !b || r.scrollWidth <= r.clientWidth) return;
    r.scrollTo({ left: b.offsetLeft - (r.clientWidth - b.offsetWidth) / 2, behavior: 'smooth' });
  }, [active]);
  return (
    <div ref={row} className="pg-names" role="group" aria-label="Choose a project">
      {projects.map((p, i) => (
        <button key={p.slug} type="button" className="pg-name" aria-current={i === active || undefined} onClick={() => onPick(i)}>
          {p.short ?? p.title}
        </button>
      ))}
    </div>
  );
}

/** The centre project's details. The title is the real link (#project/<slug>), stretched over the block. */
function Detail({ project, index, total }: { project: Project; index: number; total: number }) {
  const { open } = useProjectRoute();
  const live = project.status === 'In progress';
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    open(project.slug);
  };
  return (
    <article className="pc pg-detail" data-project-card={project.slug} aria-live="polite">
      <p className="sr-only">
        Project {index + 1} of {total}
      </p>
      <div className="pc-meta pg-reveal">
        <Badge color={projectStatusColor[project.status]} live={live}>
          {project.status}
        </Badge>
        <span className="pc-cat mono">
          {project.category} · {formatPeriod(project.period)}
        </span>
      </div>
      <h3 className="pg-title pg-reveal">
        <a href={`#project/${project.slug}`} className="pc-link" onClick={onClick}>
          {project.title}
        </a>
      </h3>
      <p className="pg-sum pg-reveal">{project.summary}</p>
      {project.recognition && (
        <p className="pc-rec pg-reveal">
          <Award size={15} aria-hidden="true" />
          {project.recognition}
        </p>
      )}
      <div className="pg-reveal">
        <TagList items={project.technologies} max={4} label="Technologies" />
      </div>
      <span className="ps-cta pg-cta pg-reveal" aria-hidden="true">
        Read the case study <ArrowUpRight size={17} />
      </span>
    </article>
  );
}

/** A round arrow on the same clear liquid glass as the top bar */
export function Step({ onClick, disabled, label, children }: { onClick: () => void; disabled: boolean; label: string; children: ReactNode }) {
  const ref = useRef<HTMLButtonElement>(null);
  const liquid = useLiquidGlass(ref);
  return (
    <button ref={ref} type="button" className="pg-arrow liquid-clear" onClick={onClick} disabled={disabled} aria-label={label}>
      {liquid}
      {children}
    </button>
  );
}
