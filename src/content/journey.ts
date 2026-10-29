import type { JourneyPhase, Milestone } from './schema';

/**
 * Journey phases, oldest first. Every stop belongs to one phase, and stops of a phase sit together.
 * The timeline shows each phase as a labelled band, so it is clear what happened when.
 */
export const journeyPhases: JourneyPhase[] = [
  { id: 'btech', label: 'During B.Tech', range: 'Nov 2021 – 2025' },
  { id: 'intern', label: 'Internship', range: 'May – Sep 2025' },
  { id: 'pat', label: 'Since joining PAT IoT', range: 'Sep 2025 – now' },
];

/**
 * The Journey timeline, oldest first. Every entry comes from the résumé or a project file.
 * `until` turns the date into a range ("Sep 2025 – Present"); add new stops at the end of their phase.
 */
export const journey: Milestone[] = [
  { phase: 'btech', when: 'Nov 2021', until: '2025', title: 'B.Tech, CSE (IoT)', text: 'Kakatiya Institute of Technology and Science, Warangal.', icon: 'GraduationCap', kind: 'study' },
  { phase: 'btech', when: 'Dec 2023', title: 'Smart India Hackathon finalist', text: 'Team leader for Smart Microgrid as a Service.', icon: 'Trophy', kind: 'award', project: 'smart-microgrid' },
  { phase: 'btech', when: 'Mar 2024', title: 'Smart surveillance', text: 'Real-time detection with OpenCV and YOLO.', icon: 'ScanEye', kind: 'build', project: 'smart-surveillance' },
  { phase: 'btech', when: '2024', title: 'Grand Contest 2024 — selected', text: 'LiDAR-enabled smartwatch for visually impaired users.', icon: 'Award', kind: 'award', project: 'lidar-smartwatch' },
  { phase: 'btech', when: '2024', title: 'IDE Bootcamp · Sumshodhini’24', text: 'Bootcamp at NIT Goa; organised a technical event at KITS.', icon: 'Rocket', kind: 'study' },
  { phase: 'btech', when: 'Apr 2025', title: 'FQ-CoDel for IoT Wi-Fi', text: 'Fair-queuing congestion control, simulated in NS-3.', icon: 'Network', kind: 'build', project: 'fq-codel-iot-wifi' },
  {
    phase: 'intern',
    when: 'May 2025',
    until: 'Sep 2025',
    title: 'Firmware Engineer Intern',
    text: 'CSR Electronologies — RTOS firmware for smart-home devices.',
    icon: 'Cpu',
    kind: 'work',
    logo: { src: '/images/companies/csr-electronologies.webp', alt: 'CSR Electronologies logo' },
  },
  {
    phase: 'pat',
    when: 'Sep 2025',
    until: 'Present',
    title: 'Embedded Software Developer',
    text: 'PAT IoT Solutions — firmware for smart-home products.',
    icon: 'Microchip',
    kind: 'work',
    logo: { src: '/images/companies/pat-iot-solutions.webp', alt: 'PAT IoT Solutions logo' },
  },
  { phase: 'pat', when: '2025', until: 'Present', title: 'Building a Matter hub', text: 'A smart-home hub on the Matter protocol, in progress.', icon: 'House', kind: 'work', project: 'smart-home-iot-hub' },
  { phase: 'pat', when: 'Apr 2026', title: 'patiot.in, built with Claude AI', text: 'Designed and deployed the company website.', icon: 'Globe', kind: 'build', project: 'pat-iot-website' },
  { phase: 'pat', when: 'Jul 2026', title: 'IoT Telemetry Device Agent', text: 'A take-home assignment in C++17.', icon: 'Server', kind: 'build', project: 'iot-telemetry-agent' },
];

/** The date label for a stop: "Sep 2025", or "Sep 2025 – Present" when it has an end. */
export const milestoneDate = (m: Milestone) => (m.until ? `${m.when} – ${m.until}` : m.when);
