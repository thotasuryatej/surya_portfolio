import { useId } from 'react';
import { useTheme } from '../../lib/theme';
import { notify } from '../../lib/island';
import './theme-toggle.css';

const PINS = [12, 16, 20];

/**
 * Theme switch drawn as a microcontroller: a package with pins on all four sides and a die in the middle.
 * Light theme "powers it up" — the pins light in sequence and the die glows like a sun.
 * Dark theme powers it down to a cool crescent on the die.
 */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const id = useId();
  const light = theme === 'light';
  const label = light ? 'Switch to dark theme' : 'Switch to light theme';

  // Pins in clockwise order from the top-left, so the "power-up" sweeps around the package.
  const pins = [
    ...PINS.map((p) => `M${p} 4.5V8`),
    ...PINS.map((p) => `M27.5 ${p}H24`),
    ...[...PINS].reverse().map((p) => `M${p} 27.5V24`),
    ...[...PINS].reverse().map((p) => `M4.5 ${p}H8`),
  ];

  return (
    <button
      type="button"
      className={`icon-btn theme-chip${light ? ' is-on' : ''} ${className}`}
      aria-label={label}
      title={label}
      onClick={() => {
        toggle();
        notify(light ? 'Dark theme on' : 'Light theme on');
      }}
    >
      <svg viewBox="0 0 32 32" width="30" height="30" fill="none" aria-hidden="true">
        <defs>
          <radialGradient id={`${id}-die`} cx="50%" cy="50%" r="60%">
            <stop offset="0" stopColor="var(--sun-1)" />
            <stop offset=".55" stopColor="var(--sun-2)" />
            <stop offset="1" stopColor="var(--sun-3)" stopOpacity="0" />
          </radialGradient>
          <mask id={`${id}-moon`}>
            <rect width="32" height="32" fill="#fff" />
            <circle className="tc-bite" cx="18.6" cy="14.2" r="3.1" fill="#000" />
          </mask>
        </defs>
        {pins.map((d, i) => (
          <path key={d} className="tc-pin" d={d} style={{ transitionDelay: light ? `${i * 18}ms` : '0ms' }} />
        ))}
        <rect className="tc-body" x="8" y="8" width="16" height="16" rx="3.5" />
        <circle className="tc-notch" cx="11" cy="11" r="0.9" />
        <circle className="tc-glow" cx="16" cy="16" r="6" fill={`url(#${id}-die)`} />
        <circle className="tc-core" cx="16" cy="16" r="3.6" mask={`url(#${id}-moon)`} />
      </svg>
    </button>
  );
}
