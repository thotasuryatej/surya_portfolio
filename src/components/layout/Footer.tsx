import { motion } from 'motion/react';
import { ArrowUp } from 'lucide-react';
import { profile } from '../../content';
import { ease } from '../../lib/motion';
import type { NavItem } from './Nav';

const letter = {
  hidden: { y: '60%', opacity: 0 },
  shown: { y: '0%', opacity: 1, transition: { duration: 1.2, ease: ease.out } },
};

/**
 * The close of the page: the section index in one row (the contact links are just above, in Contact), and behind the last line the name, set as large as
 * the page allows, faint, and sunk past the bottom edge so only the tops of the letters show. It rises a little,
 * letter by letter, as it comes into view.
 */
export function Footer({ items }: { items: NavItem[] }) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="ft-cols">
          <nav className="ft-col" aria-label="Footer">
            <p className="ft-label mono">Index</p>
            <ul role="list">
              {items.map((it, i) => (
                <li key={it.id}>
                  <a href={`#${it.id}`}>
                    <span className="ft-num mono" aria-hidden="true">
                      {String(i).padStart(2, '0')}
                    </span>
                    {it.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="ft-base mono">
          <span>
            © {new Date().getFullYear()} {profile.name} · {profile.location}
          </span>
          <a href="#home" className="footer-top">
            Back to top <ArrowUp size={15} aria-hidden="true" />
          </a>
        </div>
      </div>
      <motion.p
        className="ft-mark"
        aria-hidden="true"
        initial="hidden"
        whileInView="shown"
        viewport={{ once: true, margin: '0px 0px -5% 0px' }}
        transition={{ staggerChildren: 0.04 }}
      >
        {[...profile.name].map((c, i) => (
          <motion.span key={i} className="ft-ch" variants={letter}>
            {c === ' ' ? ' ' : c}
          </motion.span>
        ))}
      </motion.p>
    </footer>
  );
}
