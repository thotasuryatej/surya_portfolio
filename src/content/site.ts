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
  title: 'Surya Tej — Embedded Software Developer & IoT Engineer',
  description:
    'Surya Tej is an embedded software developer in Hyderabad building firmware for IoT and smart-home products — ESP32, ESP8266, Nuvoton, RTOS, lighting control and Matter — and exploring what to build next.',
  keywords: [
    'Surya Tej',
    'Embedded Software Developer',
    'IoT Engineer',
    'Firmware',
    'ESP32',
    'RTOS',
    'Matter protocol',
    'Smart home automation',
    'Hyderabad',
  ],
  ogImage: '/og-image.png',
  themeColor: '#05070b',
  themeColorLight: '#f3f6fa',

  // Order here = order on the page. `nav` controls the navigation bar.
  // To add a new section: create the component, register it in
  // src/sections/registry.tsx, then add it here.
  sections: [
    { id: 'home', label: 'Home', nav: true, enabled: true },
    { id: 'about', label: 'About', nav: true, enabled: true },
    { id: 'journey', label: 'Journey', nav: true, enabled: true },
    { id: 'build', label: 'What I Build', nav: true, enabled: true },
    { id: 'projects', label: 'Projects', nav: true, enabled: true },
    { id: 'mindset', label: 'Mindset', nav: false, enabled: true },
    { id: 'experience', label: 'Experience', nav: true, enabled: true },
    { id: 'lab', label: 'Learning Lab', nav: true, enabled: false },
    // Hidden automatically while src/content/writing/ has no entries.
    { id: 'writing', label: 'Writing', nav: true, enabled: true },
    { id: 'contact', label: 'Contact', nav: true, enabled: true },
  ],
};
