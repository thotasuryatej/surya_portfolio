import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { site } from './src/content/site';
import { profile } from './src/content/profile';
import { education, jobs } from './src/content/experience';
import { about } from './src/content/about';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** Builds <head> SEO tags from src/content so metadata never drifts from the site content. */
function seoFromContent(): Plugin {
  return {
    name: 'seo-from-content',
    transformIndexHtml(html) {
      const abs = (p: string) => (site.url ? site.url + p : p);
      const current = jobs.find((j) => j.period.end === 'present');
      const person = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: profile.name,
        // The ways people write the name, so a search for any of them finds this page
        alternateName: [profile.fullName, 'Suryatej', 'Suryatej Thota', 'Thota Suryatej'],
        description: site.description,
        ...(profile.portrait ? { image: abs(profile.portrait.src) } : {}),
        knowsAbout: ['Embedded software', 'Firmware', 'IoT', 'ESP32', 'ESP8266', 'Nuvoton', 'RTOS', 'Matter protocol'],
        jobTitle: current?.role ?? profile.roles[0],
        worksFor: current ? { '@type': 'Organization', name: current.company, url: current.website } : undefined,
        address: { '@type': 'PostalAddress', addressLocality: profile.location },
        email: `mailto:${profile.email}`,
        sameAs: profile.socials.map((s) => s.href),
        alumniOf: education.map((e) => ({ '@type': 'CollegeOrUniversity', name: e.institution })),
        ...(site.url ? { url: site.url } : {}),
      };
      // The site's own name, which Google shows above the result
      const website = site.url && {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: profile.fullName,
        alternateName: ['Surya Tej', 'suryatejpatel.in'],
        url: `${site.url}/`,
      };
      const tags = [
        `<title>${esc(site.title)}</title>`,
        `<meta name="description" content="${esc(site.description)}" />`,
        `<meta name="keywords" content="${esc(site.keywords.join(', '))}" />`,
        `<meta name="author" content="${esc(profile.name)}" />`,
        // Dark is the default theme whatever the OS prefers; theme.ts updates this once the visitor picks light
        `<meta name="theme-color" content="${site.themeColor}" />`,
        `<meta property="og:type" content="profile" />`,
        `<meta property="og:title" content="${esc(site.title)}" />`,
        `<meta property="og:description" content="${esc(site.description)}" />`,
        `<meta property="og:image" content="${esc(abs(site.ogImage))}" />`,
        `<meta property="og:image:width" content="1200" />`,
        `<meta property="og:image:height" content="630" />`,
        `<meta name="twitter:card" content="summary_large_image" />`,
        `<meta name="twitter:title" content="${esc(site.title)}" />`,
        `<meta name="twitter:description" content="${esc(site.description)}" />`,
        `<meta name="twitter:image" content="${esc(abs(site.ogImage))}" />`,
        ...(site.url
          ? [`<link rel="canonical" href="${site.url}/" />`, `<meta property="og:url" content="${site.url}/" />`]
          : []),
        // '\u003c' is the six characters \u003c, so a "<" inside the data can't close the script tag early
        ...[person, website]
          .filter(Boolean)
          .map((d) => `<script type="application/ld+json">${JSON.stringify(d).replace(/</g, '\u003c')}</script>`),
        ...(site.goatcounter
          ? [`<script data-goatcounter="https://${site.goatcounter}.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>`]
          : []),
      ];
      // Without JavaScript (some crawlers, link previews) the page still says who this is and what the work is
      const plain = [
        `<h1>${esc(profile.fullName)} — ${esc(profile.roles.slice(0, 2).join(' & '))}</h1>`,
        ...about.intro.map((s) => `<p>${esc(s)}</p>`),
        '<h2>Experience</h2>',
        '<ul>',
        ...jobs.map((j) => `<li>${esc(j.role)}, ${esc(j.company)}</li>`),
        ...education.map((e) => `<li>${esc(e.degree)}, ${esc(e.institution)}</li>`),
        '</ul>',
      ].join('\n        ');
      return html.replace('<!--seo-->', tags.join('\n    ')).replace('<!--plain-->', plain);
    },
  };
}

export default defineConfig({
  // Relative URLs: one build works at suryatejpatel.in and at thotasuryatej.github.io/surya_portfolio/.
  base: './',
  plugins: [react(), seoFromContent()],
  build: { target: 'es2022', cssCodeSplit: true },
});
