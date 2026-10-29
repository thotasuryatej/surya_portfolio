import { useEffect, useRef, useState } from 'react';
import { Check, Copy, Download, Mail, MapPin, Phone } from 'lucide-react';
import { profile } from '../content';
import { Reveal } from '../components/ui/Reveal';
import { ButtonLink } from '../components/ui/Button';
import { BrandIcon } from '../components/ui/BrandIcon';
import { useChapter } from '../lib/chapter';
import { asset } from '../lib/asset';
import { notify } from '../lib/island';
import './contact.css';

/**
 * No form: there is no backend, and a form that pretends to send would be dishonest.
 * Email opens the visitor's mail client; the address can also be copied.
 */
export function Contact() {
  const chapter = useChapter();
  const [copied, setCopied] = useState<'idle' | 'ok' | 'fail'>('idle');
  const timer = useRef<number>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied('ok');
      notify('Email address copied');
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
        <div className="ct">
          <Reveal className="ct-head">
            <p className="eyebrow">
              {chapter && (
                <span className="eyebrow-num" aria-hidden="true">
                  {chapter}
                </span>
              )}
              Contact
            </p>
            <h2 className="ct-title" id="contact-title">
              Have an idea that needs to <span className="text-accent">work?</span>
            </h2>
          </Reveal>

          {/* The signal trace that runs down the page ends here, plugged into this rule */}
          <div className="ct-rule" data-signal-end="" aria-hidden="true" />

          <Reveal className="ct-foot" delay={0.08}>
            <p className="ct-lead">
              I am happy to talk about embedded and IoT roles, collaborations, or a device you are trying to build. Email is the
              best way to reach me.
            </p>

            <div className="ct-actions">
              <div className="ct-email">
                <a className="ct-addr" href={`mailto:${profile.email}?subject=${subject}`}>
                  <Mail size={22} aria-hidden="true" />
                  {profile.email}
                </a>
                <button type="button" className="icon-btn ct-copy-btn" onClick={copy} aria-label="Copy email address">
                  {copied === 'ok' ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
                </button>
                <span className="ct-status" role="status">
                  {copied === 'ok'
                    ? 'Email address copied'
                    : copied === 'fail'
                      ? 'Could not copy — please select the address instead'
                      : ''}
                </span>
              </div>

              <div className="ct-btns">
                <ButtonLink
                  variant="primary"
                  href={`mailto:${profile.email}?subject=${subject}`}
                  icon={<Mail size={18} aria-hidden="true" />}
                >
                  Send an email
                </ButtonLink>
                <ButtonLink
                  href={asset(profile.resume.file)}
                  download={profile.resume.downloadName}
                  icon={<Download size={18} aria-hidden="true" />}
                >
                  Download résumé
                </ButtonLink>
                {profile.socials.map((s) => (
                  <ButtonLink
                    key={s.href}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    icon={<BrandIcon icon={s.icon} />}
                  >
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
          </Reveal>
        </div>
      </div>
    </section>
  );
}
