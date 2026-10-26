import { ArrowUp } from 'lucide-react';
import { profile } from '../../content';
import { Monogram } from '../brand/Monogram';

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-id">
          <Monogram size={26} />
          <span>
            © {new Date().getFullYear()} {profile.name} · {profile.location}
          </span>
        </div>
        <a href="#home" className="footer-top">
          Back to top <ArrowUp size={15} aria-hidden="true" />
        </a>
      </div>
    </footer>
  );
}
