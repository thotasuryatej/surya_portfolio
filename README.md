# Surya Tej — portfolio

A personal engineering portfolio built with React, TypeScript and Vite. It uses a "liquid glass"
interface, and every piece of content lives in plain TypeScript files under `src/content/`.

- **To add or edit content** (projects, journey, résumé and so on), read [CONTENT_GUIDE.md](CONTENT_GUIDE.md).
- It builds to a static `dist/` folder. There is no server, database, API key or paid service.

## Run it

Requires Node 20 or newer (developed on Node 22).

```bash
npm install
npm run dev        # http://localhost:5173
npm run validate   # check content only
npm run build      # validate content + type-check + production build into dist/
npm run preview    # serve dist/ at http://localhost:4173
```

## Deploy (free static hosting)

The output is just `dist/`. Any static host works:

| Host | Setup |
| --- | --- |
| **Netlify** | New site from your repo. Build command `npm run build`, publish directory `dist`. Or drag the `dist` folder onto app.netlify.com/drop. |
| **Cloudflare Pages** | Framework preset "Vite", build command `npm run build`, output `dist`. |
| **Vercel** | Import the repo; Vite is detected automatically (output `dist`). |
| **GitHub Pages** | Works best as a user site (`<username>.github.io`) or with a custom domain, because asset paths start at `/`. Build, then publish `dist/` with the "Deploy static content to Pages" Action. A project sub-path (`/<repo>/`) would need Vite's `base` option and content paths changed to match. |

After you have a domain, set `url` in `src/content/site.ts` (for example `https://suryatej.dev`, with no trailing
slash) and rebuild. This adds the canonical tag and absolute social-preview image URLs, which some
platforms (LinkedIn, X) need before they show the preview card.

Routing uses `#hash` links only (`/#projects`, `/#project/<slug>`), so no redirect rules are needed on any host.

## How it is built

```
src/
  content/        ← all text and data (see CONTENT_GUIDE.md)
    projects/     ← one file per project; files starting with "_" are templates
    journey.ts    ← the Journey phases and milestones
    lab/          ← one file per Learning Lab entry (section currently hidden in site.ts)
    writing/      ← one file per article (section appears once there is one)
    schema.ts     ← the types every content file is checked against
    validate.ts   ← runtime checks (dates, slugs, links, media files, alt text, statuses)
  sections/       ← one component per page section, plus registry.tsx (id → component)
  components/     ← nav, glass primitives, project cards/dialog, diagrams, visuals
  styles/         ← design tokens, base styles, and the liquid-glass material (glass.css)
scripts/
  validate-content.mjs   ← runs validate.ts through Vite (used by npm run validate / build)
  smoke.mjs              ← dev-only browser interaction test (see below)
  inspect.mjs            ← dev-only: screenshots at 5 widths + horizontal-overflow check
  inspect-sections.mjs   ← dev-only: one screenshot per section
public/
  resume/                ← the downloadable PDF (unchanged copy of the original)
  media/                 ← project and lab photos/videos
  og-image.png, apple-touch-icon.png, favicon.svg
```

- **SEO.** `vite.config.ts` reads `src/content/site.ts`, `profile.ts` and `experience.ts` at build time
  and writes the `<title>`, description, Open Graph and Twitter tags, and Person JSON-LD into `index.html`.
- **Liquid glass.** `.glass` in `src/styles/glass.css` layers a blurred, saturated backdrop, a
  light-catching rim, and a specular highlight that follows the pointer. An SVG refraction filter was
  tried and removed: re-filtering the backdrop on every scroll frame made scrolling stutter.
- **Why an SVG hero instead of Three.js.** The hero "circuit core" is hand-built SVG and CSS. It
  stays sharp at every size, costs a few kilobytes instead of a roughly 600 KB WebGL library, works
  with reduced motion and screen readers, and doesn't drain phone batteries. For a portfolio whose
  point is the content, a 3D scene would mostly add load time.
- **Motion.** Scrolling is the browser's own (compositor-driven, so it never waits on JavaScript);
  in-page links glide via `scroll-behavior: smooth` unless reduced motion is set. Section headings rise word by
  word (`SectionHead` in `Reveal.tsx`), the About portrait "boots up" as it scrolls into view, and
  Journey pins on screens 900 px and wider while the timeline scrolls sideways; narrower screens and
  reduced motion get a vertical list instead. All scroll effects animate `transform`, `opacity` or `clip-path` only.
- **Brand mark.** `src/components/brand/Monogram.tsx` draws the ST logo (angular S and T letterforms with
  copper circuit traces), traced from my own artwork into `stPaths.ts` and coloured per theme. Static copies live in `public/brand/`, and `favicon.svg` follows the system theme.
- **Performance.** Sections below the fold use `content-visibility: auto`, so off-screen sections
  aren't laid out or painted until they're near the viewport. `App.tsx` re-aligns in-page jumps once
  scrolling settles, because those sections' heights are estimates until they first render.
- **Accessibility.** There's a skip link, landmarks, one `h1`, keyboard-operable tabs, a native
  `<dialog>` for case studies (focus trap and Escape), visible focus rings, `aria-live` status messages,
  and AA text contrast. All motion respects `prefers-reduced-motion`.

## Testing

`npm run test:smoke` drives the site in Microsoft Edge (via `playwright-core` with
`channel: 'msedge'`; change that line to `'chrome'` if you use Chrome). Start `npm run dev` or
`npm run preview` first, and pass the URL if it isn't the dev server:

```bash
npm run test:smoke -- http://localhost:4173/
```

It checks:

- **Navigation:** nav links and the current-section highlight, and loading the page with a section hash.
- **Theme and story:** the theme toggle switching both ways, a Journey stop opening its case study, and the "How I build" core's keyboard controls.
- **What I Build:** the capability tabs' keyboard controls, and the dimming demo.
- **Case studies:** opening and closing (Escape and the browser Back button), deep links, Previous/Next, and the FQ-CoDel simulation controls.
- **Contact:** that the résumé PDF is served, copying the email address, and the mailto link.
- **Mobile:** the mobile menu, reduced-motion behaviour, and no horizontal overflow.
- Any console errors.

## Copyright

Copyright (c) 2026 Surya Tej Thota. All rights reserved. The code, design, content, images, and ST logo
are mine; this repository is public to read, not to reuse. Copying or adapting any of it requires my
written permission. See [LICENSE](LICENSE). Third-party components keep their own licences.
