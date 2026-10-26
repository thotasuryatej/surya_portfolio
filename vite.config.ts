import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { site } from './src/content/site';
import { profile } from './src/content/profile';
import { education, jobs } from './src/content/experience';

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
        jobTitle: current?.role ?? profile.roles[0],
        worksFor: current ? { '@type': 'Organization', name: current.company, url: current.website } : undefined,
        address: { '@type': 'PostalAddress', addressLocality: profile.location },
        email: `mailto:${profile.email}`,
        sameAs: profile.socials.map((s) => s.href),
        alumniOf: education.map((e) => ({ '@type': 'CollegeOrUniversity', name: e.institution })),
        ...(site.url ? { url: site.url } : {}),
      };
      const tags = [
        `<title>${esc(site.title)}</title>`,
        `<meta name="description" content="${esc(site.description)}" />`,
        `<meta name="keywords" content="${esc(site.keywords.join(', '))}" />`,
        `<meta name="author" content="${esc(profile.name)}" />`,
        `<meta name="theme-color" media="(prefers-color-scheme: dark)" content="${site.themeColor}" />`,
        `<meta name="theme-color" media="(prefers-color-scheme: light)" content="${site.themeColorLight}" />`,
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
        `<script type="application/ld+json">${JSON.stringify(person).replace(/</g, '\u003c')}</script>`,
      ];
      return html.replace('<!--seo-->', tags.join('\n    '));
    },
  };
}

export default defineConfig({
  plugins: [react(), seoFromContent()],
  build: { target: 'es2022', cssCodeSplit: true },
});
