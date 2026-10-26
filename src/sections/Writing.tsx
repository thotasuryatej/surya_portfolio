import { ArrowUpRight } from 'lucide-react';
import { articles } from '../content';
import { Reveal, SectionHead } from '../components/ui/Reveal';
import { TagList } from '../components/ui/Badge';
import './lab.css';

/** Shown only when src/content/writing/ contains at least one article. */
export function Writing() {
  if (!articles.length) return null;
  return (
    <section id="writing" className="section" aria-labelledby="writing-title">
      <div className="container">
        <SectionHead id="writing-title" eyebrow="Writing" title="Notes and articles" />
        <ul className="lab-grid" role="list">
          {articles.map((a, i) => {
            const external = /^https?:/.test(a.href);
            return (
              <Reveal as="li" key={a.slug} delay={(i % 3) * 0.06}>
                <article className="lab surface">
                  <p className="lab-idx mono">
                    <time dateTime={a.date}>
                      {new Date(a.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </time>
                  </p>
                  <h3 className="lab-title">
                    <a href={a.href} className="pc-link" {...(external && { target: '_blank', rel: 'noopener noreferrer' })}>
                      {a.title}
                    </a>
                  </h3>
                  <p className="lab-sum">{a.summary}</p>
                  {a.tags && <TagList items={a.tags} />}
                  <span className="pc-cta lab-foot" aria-hidden="true">
                    Read <ArrowUpRight size={16} />
                  </span>
                </article>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
