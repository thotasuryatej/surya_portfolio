import type { SiteConfig } from './schema';

/**
 * Site-wide settings: SEO metadata and the order / visibility of sections.
 * This file is also read by vite.config.ts to fill in <head> tags at build time,
 * so keep it free of imports other than types.
 */
export const site: SiteConfig = {
  // The site's own domain (no trailing slash).
  // It enables absolute social-preview URLs and the canonical tag.
  url: 'https://suryatejpatel.in',
  // Search engines weigh the title most: the full name, then the work people search for
  title: 'Surya Tej Thota — Embedded Software & Firmware Developer, IoT Engineer',
  description:
    'Surya Tej Thota (Suryatej) is an embedded software and firmware developer in Hyderabad building firmware for IoT and smart-home products — ESP32, ESP8266, Nuvoton, RTOS and Matter — and exploring what to build next.',
  keywords: [
    'Surya Tej',
    'Surya Tej Thota',
    'Suryatej',
    'Suryatej Thota',
    'Thota Suryatej',
    'Embedded Software Developer',
    'Embedded Firmware Developer',
    'Firmware Engineer',
    'IoT Engineer',
    'Firmware',
    'ESP32',
    'RTOS',
    'Matter protocol',
    'Smart home automation',
    'Hyderabad',
  ],
  // The ?v= changes whenever the image does, so link previews and browsers fetch it fresh instead of a saved copy
  ogImage: '/og-image.png?v=st',
  themeColor: '#0b0a09',
  themeColorLight: '#f5f2eb',
  // Visitor counts at https://suryatejpatel.goatcounter.com: no cookies, and visits from localhost aren't counted
  goatcounter: 'suryatejpatel',

  // Order here = order on the page. `nav` controls the navigation bar.
  // To add a new section: create the component, register it in
  // src/sections/registry.tsx, then add it here.
  sections: [
    { id: 'home', label: 'Home', nav: true, enabled: true },
    { id: 'about', label: 'About', nav: true, enabled: true },
    { id: 'journey', label: 'Journey', nav: true, enabled: true },
    // Off: About, Projects and Experience already cover these areas, and the page reads simpler without it
    { id: 'build', label: 'What I Build', nav: true, enabled: false },
    { id: 'projects', label: 'Projects', nav: true, enabled: true },
    { id: 'mindset', label: 'Mindset', nav: false, enabled: true },
    { id: 'experience', label: 'Experience', nav: true, enabled: true },
    { id: 'lab', label: 'Learning Lab', nav: true, enabled: false },
    // Hidden automatically while src/content/writing/ has no entries.
    { id: 'writing', label: 'Writing', nav: true, enabled: true },
    { id: 'contact', label: 'Contact', nav: true, enabled: true },
  ],
};
