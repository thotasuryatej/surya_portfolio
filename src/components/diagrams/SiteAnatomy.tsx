import { useState } from 'react';
import { Monitor, Smartphone } from 'lucide-react';

const PARTS = [
  { id: 'nav', n: 1, title: 'Navigation & structure', text: 'Company and product information organised into a clear structure, so visitors find what they need quickly.' },
  { id: 'products', n: 2, title: 'Product information', text: 'Products presented in a consistent, scannable layout — structured for a clearer user experience and better accessibility.' },
  { id: 'company', n: 3, title: 'Company information', text: 'Who the company is and how to reach it, kept separate from product details.' },
  { id: 'responsive', n: 4, title: 'Responsive layout', text: 'Modern layouts that reflow for phones, tablets and desktops. Switch the viewport above to see the idea.' },
  { id: 'deploy', n: 5, title: 'Deployed for production', text: 'Deployment workflows and front-end improvements took the site live — built with Claude AI assisting UI development, deployment and workflow integration.' },
] as const;

type PartId = (typeof PARTS)[number]['id'];

/** A labelled wireframe of the website's anatomy — a concept, not a screenshot of patiot.in. */
export function SiteAnatomy() {
  const [active, setActive] = useState<PartId>('products');
  const [mobile, setMobile] = useState(false);
  const part = PARTS.find((p) => p.id === active)!;
  // A render helper, not a component, so buttons keep focus across re-renders.
  const pin = (id: PartId) => {
    const p = PARTS.find((x) => x.id === id)!;
    return (
      <button type="button" className="sa-pin" aria-pressed={id === active} onClick={() => setActive(id)} aria-label={`${p.n}. ${p.title}`}>
        {p.n}
      </button>
    );
  };

  return (
    <div className="dg">
      <div className="sa-bar">
        <div className="seg" role="group" aria-label="Viewport">
          <button type="button" aria-pressed={!mobile} onClick={() => setMobile(false)}>
            <Monitor size={15} aria-hidden="true" /> Desktop
          </button>
          <button
            type="button"
            aria-pressed={mobile}
            onClick={() => {
              setMobile(true);
              setActive('responsive');
            }}
          >
            <Smartphone size={15} aria-hidden="true" /> Mobile
          </button>
        </div>
      </div>

      <div className={`sa-stage${mobile ? ' is-mobile' : ''}`}>
        <div className="sa-browser" data-focus={active}>
          <div className="sa-chrome" aria-hidden="true">
            <i />
            <i />
            <i />
            <span className="sa-url">patiot.in</span>
          </div>
          <div className="sa-page">
            <div className="sa-nav" data-part="nav">
              <span className="sa-logo" aria-hidden="true" />
              <span className="sa-links" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              {pin('nav')}
            </div>
            <div className="sa-hero" aria-hidden="true">
              <i className="sa-h1" />
              <i className="sa-line" />
              <i className="sa-line sa-line--s" />
              <i className="sa-btn" />
            </div>
            <div className="sa-products" data-part="products">
              {[0, 1, 2].map((i) => (
                <span key={i} className="sa-card" aria-hidden="true">
                  <i />
                </span>
              ))}
              {pin('products')}
            </div>
            <div className="sa-company" data-part="company">
              <span className="sa-line" aria-hidden="true" />
              <span className="sa-line sa-line--s" aria-hidden="true" />
              {pin('company')}
            </div>
            <div className="sa-foot" data-part="deploy">
              <span className="sa-live" aria-hidden="true" />
              <span className="mono">deployed</span>
              {pin('deploy')}
            </div>
          </div>
          <span className="sa-resp" data-part="responsive">
            {pin('responsive')}
          </span>
        </div>
      </div>

      <div className="dg-detail" aria-live="polite">
        <strong>
          {part.n}. {part.title}
        </strong>
        <p>{part.text}</p>
      </div>
      <p className="dg-note">
        A labelled concept of the site&apos;s structure, not a screenshot. The real site is at{' '}
        <a className="text-link" href="https://patiot.in/" target="_blank" rel="noopener noreferrer">
          patiot.in<span className="sr-only"> (opens in a new tab)</span>
        </a>
        .
      </p>
    </div>
  );
}
