import { useEffect, useRef, useState } from 'react';
import { Check, Copy, Mail, MapPin, Phone } from 'lucide-react';
import { profile } from '../content';
import { Reveal } from '../components/ui/Reveal';
import { ButtonLink } from '../components/ui/Button';
import { BrandIcon } from '../components/ui/BrandIcon';
import { Glass } from '../components/ui/Glass';
import './contact.css';

/**
 * No form: there is no backend, and a form that pretends to send would be dishonest.
 * Email opens the visitor's mail client; the address can also be copied.
 */
export function Contact() {
  const [copied, setCopied] = useState<'idle' | 'ok' | 'fail'>('idle');
  const timer = useRef<number>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied('ok');
    } catch {
      setCopied('fail');
    }
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied('idle'), 2500);
  };

  const subject = encodeURIComponent('Hello from your portfolio');

  return (
    <section id="contact" className="section contact" aria-labelledby="contact-title">
      <div className="container">
        <Reveal>
          <Glass className="ct">
            <div className="ct-copy">
              <p className="eyebrow">Contact</p>
              <h2 className="h2" id="contact-title">
                Have an idea that needs to <span className="text-accent">work?</span>
              </h2>
              <p className="lead">
                I am happy to talk about embedded and IoT roles, collaborations, or a device you are trying to build. Email is the best way to
                reach me.
              </p>
            </div>

            <div className="ct-actions">
              <div className="ct-email">
                <a className="ct-addr" href={`mailto:${profile.email}?subject=${subject}`}>
                  <Mail size={20} aria-hidden="true" />
                  {profile.email}
                </a>
                <button type="button" className="icon-btn ct-copy-btn" onClick={copy} aria-label="Copy email address">
                  {copied === 'ok' ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
                </button>
                <span className="ct-status" role="status">
                  {copied === 'ok' ? 'Email address copied' : copied === 'fail' ? 'Could not copy — please select the address instead' : ''}
                </span>
              </div>

              <div className="ct-btns">
                <ButtonLink variant="primary" href={`mailto:${profile.email}?subject=${subject}`} icon={<Mail size={18} aria-hidden="true" />}>
                  Send an email
                </ButtonLink>
                {profile.socials.map((s) => (
                  <ButtonLink key={s.href} href={s.href} target="_blank" rel="noopener noreferrer" icon={<BrandIcon icon={s.icon} />}>
                    {s.label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </ButtonLink>
                ))}
              </div>

              <ul className="ct-meta" role="list">
                <li>
                  <MapPin size={15} aria-hidden="true" /> {profile.location}
                </li>
                {profile.showPhone && profile.phone && (
                  <li>
                    <Phone size={15} aria-hidden="true" />
                    <a href={`tel:${profile.phone.replace(/\s/g, '')}`}>{profile.phone}</a>
                  </li>
                )}
              </ul>
            </div>
          </Glass>
        </Reveal>
      </div>
    </section>
  );
}
