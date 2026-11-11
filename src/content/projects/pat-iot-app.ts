import { defineProject } from '../schema';

// Facts from the app's git history (from 2026-09). Kept general on purpose: no server details or internal names.
// Launched on Google Play and the App Store in Nov 2026. The pictures are the app's published store
// screenshots (D:/PAT_IOT/store_screenshots/final); the cover is a banner composed from them and the store icon.
const img = (name: string) => `/media/projects/pat-iot-app/${name}.webp`;
export default defineProject({
  slug: 'pat-iot-app',
  title: 'PAT IoT App — Next Version',
  short: 'PAT IoT App',
  category: 'Apps',
  summary:
    'Redesigned and launched the company’s Flutter smart-home app on Android and iOS: a new look, home-screen widgets, faster everyday control and safer builds.',
  status: 'Deployed',
  period: { start: '2026-09', end: '2026-11' },
  updated: '2026-11',
  role: 'Designed and built the new version with Claude AI as my coding assistant — UI, Flutter code, native widgets, security and release builds',
  technologies: ['Flutter', 'Dart', 'Kotlin', 'Swift', 'Android', 'iOS', 'WebSocket', 'CI/CD', 'Claude AI'],
  order: 1.5,
  visual: 'blueprint',
  cover: {
    type: 'image',
    src: img('cover'),
    alt: 'Banner for the new PAT IoT app: the app icon, “Redesigned for Android and iOS”, and three phone screens showing Home, widgets and scene editing',
  },
  overview: [
    'PAT IoT customers control their switches, fans and scenes from the company’s mobile app. I took the existing Flutter app and built its next version: a fresh design, new features and a cleaner, safer codebase. It is now live on Google Play and the App Store.',
    'I used Claude AI (an LLM) as my coding assistant throughout, to get the redesign right in detail and keep the update secure, while I owned the design decisions, testing on real devices and the release.',
    'The app’s code has roughly doubled, from about 4,800 lines of Dart to about 10,700, plus native home-screen widgets written in Kotlin for Android and Swift for iOS.',
  ],
  sections: [
    {
      heading: 'From the old app to the new one',
      body: ['What changed for the people using it:'],
      bullets: [
        'Redesigned Home, room and scene screens, with light and dark themes.',
        'Home-screen widgets on Android and iOS that run scenes, switches and whole rooms without opening the app.',
        'Long-press app shortcuts, and one “Leaving home” button that sets chosen devices in every room.',
        'Switch tiles change only after the device confirms, and a clear message appears when a device does not respond.',
        'Fans turn back on at their last speed; room pictures and device icons are suggested from the name you type.',
      ],
    },
    {
      heading: 'Under the hood',
      body: ['Work that users do not see but rely on:'],
      bullets: [
        'A code audit that fixed small bugs, memory leaks and dead code.',
        'Login token kept in encrypted storage, app backups turned off and release builds obfuscated.',
        'A built-in demo mode with a simulated backend, so the app can be tried and tested without real devices.',
        'Automated builds: iOS TestFlight builds through Codemagic and Android test builds through GitHub Actions, with separate beta and demo apps.',
      ],
    },
  ],
  media: [
    { type: 'image', src: img('home'), alt: 'Home screen: greetings, scenes and favourites, and room cards', caption: 'Your home at a glance' },
    { type: 'image', src: img('room'), alt: 'A room’s devices: switches, a fan and curtain controls', caption: 'Control every device' },
    { type: 'image', src: img('widgets'), alt: 'Home-screen widgets for rooms, scenes and Leaving home', caption: 'Home-screen widgets' },
    { type: 'image', src: img('scene'), alt: 'Editing a scene, setting each device to skip, on or off', caption: 'Create your own scenes' },
    { type: 'image', src: img('theme'), alt: 'Account menu with the light, dark or system theme choice', caption: 'Light, dark or system theme' },
  ],
  links: [
    { label: 'Google Play', href: 'https://play.google.com/store/apps/details?id=com.patiot.pat_home', kind: 'external' },
    { label: 'App Store', href: 'https://apps.apple.com/in/app/pat-iot/id6479612068', kind: 'external' },
  ],
});
