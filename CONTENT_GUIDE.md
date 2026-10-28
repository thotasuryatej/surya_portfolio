# Content guide

Everything you see on the site lives in `src/content/`. You never need to touch a component
to add a project, log something you are learning, or update your résumé.

After any change, run:

```bash
npm run validate   # checks your content and explains any mistake in plain words
npm run dev        # preview at http://localhost:5173 (also shows content warnings in the browser console)
```

`npm run build` runs the validator too, so a broken entry can never be published by accident.

---

## Add a project (one file)

1. Copy `src/content/projects/_template.ts` to `src/content/projects/<your-slug>.ts`
   (for example `ble-sensor-node.ts`). Files that start with `_` are ignored.
2. Fill in the required fields: `slug`, `title`, `category`, `summary`, `status`, `period`,
   `role`, `technologies`, `overview`.
3. Delete any optional line you don't have real content for. **Don't leave placeholder text**;
   the site hides empty fields.
4. Run `npm run validate`.

The project appears in the Projects grid automatically, and its case study opens at
`/#project/<your-slug>` (you can share that link directly).

| Field | What it does |
| --- | --- |
| `status` | `In progress`, `Deployed`, `Completed`, `Prototype`, `Research`, `Academic` or `Concept`. Be honest: in-progress work is shown as in progress. |
| `period` | `{ start: '2026-11' }`, plus `end: '2027-02'` or `end: 'present'`. Dates can be `2026`, `2026-11` or `2026-11-14`. |
| `featured` | `true` gives the large card at the top. Only one project should be featured. |
| `order` | A lower number shows earlier. Without it, projects are sorted newest first. |
| `visual` | The card illustration when there's no photo: `iot-hub`, `web`, `queue`, `vision`, `microgrid`, `lidar` or `blueprint`. Cards using one are labelled "Illustration". |
| `diagram` | An optional interactive diagram in the case study: `iot-architecture`, `fq-codel`, `energy-flow` or `telemetry-replay`. |
| `progress` | `{ done: [...], ongoing: [...] }`, shown as two checklists. |
| `highlights`, `sections` | Extra detail for the case study. |
| `cover`, `media` | Real photos or videos (see below). A `cover` replaces the illustration. |
| `links` | Source code, demo, article and so on. Only add links that work. |
| `note` | A short honest note, such as "Code is proprietary to my employer." |

## Add a Learning Lab entry (one file)

The Learning Lab section is currently hidden (`enabled: false` for `lab` in `src/content/site.ts`).
Its entries are kept, so switching it back on is a one-line change.

Copy `src/content/lab/_template.ts` to `src/content/lab/<slug>.ts`.
Status is `Exploring`, `Building`, `Testing`, `Completed` or `Paused`.
Update `updated` whenever you add to it, because entries are sorted by most recently updated.
Leave `discovered` out until you have actually found something out.

When a Lab experiment becomes a real project, add a project file and set
`relatedProject: '<project-slug>'` on the Lab entry.

## Add an article

Copy `src/content/writing/_template.ts` to `src/content/writing/<slug>.ts`.
The **Writing** section and its nav link appear automatically once there is at least one article.

## Add photos, screenshots or videos

1. Put the file under `public/media/projects/<slug>/` (or `public/media/lab/<slug>/`).
   Prefer `.webp` for images, around 1600px wide, and `.mp4` for video.
2. Reference it with a path that starts with `/media/...`:

```ts
cover: { type: 'image', src: '/media/projects/ble-sensor-node/cover.webp', alt: 'The sensor node on a breadboard' },
media: [
  { type: 'image', src: '/media/projects/ble-sensor-node/pcb.webp', alt: 'Rev A PCB', caption: 'First board revision' },
  { type: 'video', src: '/media/projects/ble-sensor-node/demo.mp4', alt: 'Live readings on the dashboard', poster: '/media/projects/ble-sensor-node/poster.webp' },
],
```

Every image needs `alt` text that describes it. The validator checks both that the file exists and
that the alt text is there.

## Portrait

The About section has a "board" for your photo that powers up as it scrolls into view. Until you add one,
it shows a clearly labelled placeholder (never a generated face).

1. Export a real photo as WebP, portrait 4:5, at least 1000 × 1250 px (around 150 KB is plenty).
   Keep your face in the upper-middle; the frame crops the edges slightly.
2. Save it in `public/images/` under a **new** filename (for example `surya-tej-2.webp`) and update
   `portrait.src` in `src/content/profile.ts`. Browsers cache images by URL, so reusing the old name
   can leave visitors seeing the previous picture.
3. In `src/content/profile.ts`, set `portrait.placeholder` to `false`. The status light then reads "ONLINE".
4. Run `npm run validate`; the placeholder warning disappears.
5. Optional: a second photo for the dark theme. Save it the same way and set `portrait.srcDark`;
   the light theme keeps `portrait.src`. Leave `srcDark` out to use one photo in both themes.

## Update your résumé

The résumé is built from `resume-source/resume.html`. Edit that file, then run `npm run resume`
(needs Microsoft Edge; set `RESUME_BROWSER=chrome` to use Chrome). It writes two PDFs:

- `public/resume/Surya-Tej-Resume.pdf`, the copy the site serves. The phone number is hidden (anything marked `class="private"`).
- `resume-source/Surya-Tej-Resume-full.pdf`, with the phone number, for direct applications. `resume-source/` is git-ignored so the number never reaches the public repo.

Then change `resume.updated` in `src/content/profile.ts`. The original `SuryaTej (1).pdf` is never touched.

## Other things you might change

| To change… | Edit |
| --- | --- |
| Name, email, phone, location, social links | `src/content/profile.ts`. The phone number is left out on purpose, because this file ships in the public bundle. To show one, add `phone` and set `showPhone: true`. |
| Add GitHub | Uncomment the GitHub line in `profile.ts` and put in your real username. |
| Hero text and the hero's skill nodes | `src/content/hero.ts` |
| About text and the "at a glance" tiles | `src/content/about.ts`. Each `glance` tile has an `icon`, a `label` and a few short `items`. |
| Journey timeline | `src/content/journey.ts`. Phases (`journeyPhases`: `id`, `label`, `range`) show as labelled bands. One milestone per entry, oldest first: `phase` (a phase id; stops of a phase sit together), `when`, optional `until` (shown as `when – until`, e.g. `Sep 2025 – Present`), `title`, one-line `text`, `icon`, and `kind` (`study`, `award`, `work` or `build`, which sets its colour). Add `project: '<slug>'` to make the stop open that case study, or `logo` to show a company logo. Only add things that really happened. |
| "What I Build" areas | `src/content/capabilities.ts` |
| Jobs and education | `src/content/experience.ts`. Put the newest job first. |
| Awards and programmes | `src/content/achievements.ts` |
| The six "How I build" steps | `src/content/mindset.ts`. `short` is the one-word label around the core; `title` and `text` show in the panel; `example.project` adds the "Seen in" link. Keep exactly six steps, since the core has six segments. |
| Page title, description, keywords, domain | `src/content/site.ts`. Set `url` once you have a domain. |
| Section order, or hiding a section | The `sections` list in `src/content/site.ts` (`enabled: false` hides it) |

### Icons

Content files refer to icons by name, for example `icon: 'Cpu'`. The available names are listed in
`src/components/ui/icons.ts`. To use another icon from [lucide.dev](https://lucide.dev/icons),
import it in that file and add it to the map. If a name doesn't exist, the validator warns you and
a default icon is shown.

## Honesty checklist (worth keeping)

- Only claim what you actually did, with the role you actually had.
- Mark unfinished work as `In progress`, and use `progress.ongoing` for the parts that aren't done.
- No made-up numbers. If you measured something, say how.
- Every illustration that isn't a real photo is labelled automatically, so keep it that way.
