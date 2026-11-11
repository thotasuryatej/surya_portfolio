import { defineProject } from '../schema';

// Facts from my commit in github.com/thotasuryatej/Telugu_TV_launcher (2026-11-07),
// a fork of the open-source CleanYourTV launcher by Gathin23.
// All pictures are real screenshots from my Sony BRAVIA, taken from that repo's docs folder. The cover is
// home.webp unchanged inside a plain TV frame at 16:10, so it fits the cards without cropping.
const img = (name: string) => `/media/projects/telugu-tv-launcher/${name}.webp`;

export default defineProject({
  slug: 'telugu-tv-launcher',
  title: 'Telugu TV Launcher',
  short: 'Telugu TV Launcher',
  category: 'Apps',
  summary:
    'A Telugu home screen for Android and Google TV: a Telugu calendar beside the clock, festival animations, family birthdays and a photo screensaver.',
  status: 'Passion project',
  period: { start: '2026-11' },
  updated: '2026-11',
  role: 'Built the Telugu features on top of the open-source CleanYourTV launcher',
  technologies: ['Java', 'Android TV', 'Google TV', 'JUnit', 'ADB'],
  order: 1.8,
  visual: 'blueprint',
  cover: {
    type: 'image',
    src: img('cover'),
    alt: 'The launcher on a TV: the clock with the Telugu date, masam, tithi and nakshatram, a Deepavali greeting, and a grid of apps',
  },
  overview: [
    'CleanYourTV is an open-source launcher that replaces the ad-filled home screen on Android and Google TVs. I built a Telugu version of it for my family’s TV, so the home screen speaks their language and knows their calendar.',
    'Everything runs on the TV itself, with no internet service needed: the panchangam, the festival dates and the yearly family days are all calculated on the device.',
  ],
  sections: [
    {
      heading: 'Telugu calendar and festivals',
      body: [
        'Beside the clock, the launcher shows the Telugu day and date with the masam, tithi and nakshatram, including adhika masam years.',
        'Telugu festivals and the New Year switch on by themselves, each with its own animation, played once so it never gets in the way.',
      ],
    },
    {
      heading: 'Family days',
      body: ['Birthdays and anniversaries show a Telugu wish on the day, with the right age worked out every year.'],
    },
    {
      heading: 'Easier to use with a remote',
      body: ['Small changes that matter when the only input is a TV remote:'],
      bullets: [
        'Moving an app swaps it with the one it lands on, instead of shifting the whole grid.',
        'An optional layout fits every app on one screen.',
        'A quick settings panel on the Settings button, and a crossed-out Wi-Fi icon while offline.',
        'A photo screensaver that shows the TV’s own photos whole, with a picker for the TV and USB drives.',
      ],
    },
    {
      heading: 'Built and tested',
      body: [
        'About 2,100 lines added across the launcher and its add-ons, mostly Java, with unit tests for the panchangam, festival dates, app swapping and the one-screen layout. Tested on a Sony BRAVIA running Google TV 14, and kept within the launcher’s 600 KB size limit.',
      ],
    },
  ],
  media: [
    { type: 'image', src: img('festival'), alt: 'Deepavali sparks falling across the home screen, with the Telugu greeting above the clock', caption: 'A festival switches on by itself with its own animation' },
    { type: 'image', src: img('swap'), alt: 'An app tile being moved, the other tiles dimmed while it is carried', caption: 'Moving an app swaps it with the one it lands on' },
    { type: 'image', src: img('fit-all'), alt: 'Every app fitting on one screen in a four-column grid', caption: 'The optional layout keeps every app on one screen' },
    { type: 'image', src: img('quick-settings'), alt: 'The quick settings panel open from the Settings button: TV settings, display, network, apps and launcher settings', caption: 'Quick settings on the Settings button' },
    { type: 'image', src: img('screensaver'), alt: 'The screensaver picture picker, with preview, start time and photo sources', caption: 'Choosing photos for the screensaver' },
  ],
  links: [{ label: 'Source code', href: 'https://github.com/thotasuryatej/Telugu_TV_launcher', kind: 'source' }],
  note: 'Built on CleanYourTV by Gathin23; my work is the Telugu features listed here.',
});
