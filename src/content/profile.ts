import type { Profile } from './schema';

export const profile: Profile = {
  name: 'Surya Tej',
  /** Shown in the top bar. */
  fullName: 'Thota Suryatej',
  shortName: 'Surya',
  initials: 'ST',
  headline: 'An engineer who turns ideas into things that work.',
  roles: ['Embedded Software Developer', 'IoT Engineer', 'Inventor', 'Lifelong Learner'],
  location: 'Hyderabad, India',
  email: 'thotasuryatej@gmail.com',
  // No phone number here: anything in this file ships in the public JavaScript bundle.
  // To show one in Contact, add phone: '…' and set showPhone: true.
  showPhone: false,
  portrait: {
    src: '/images/surya-tej.webp',
    srcDark: '/images/surya-tej-dark.webp',
    alt: 'Portrait of Surya Tej',
    placeholder: false,
  },
  socials: [
    {
      label: 'LinkedIn',
      handle: 'thota-suryatej',
      href: 'https://www.linkedin.com/in/thota-suryatej/',
      icon: 'linkedin',
    },
    {
      label: 'GitHub',
      handle: 'thotasuryatej',
      href: 'https://github.com/thotasuryatej',
      icon: 'github',
    },
  ],
  resume: {
    // To update: edit resume-source/resume.html, run `npm run resume`, then change `updated`.
    file: '/resume/Surya-Tej-Resume.pdf',
    downloadName: 'Surya-Tej-Resume.pdf',
    updated: '2026-10',
  },
};
