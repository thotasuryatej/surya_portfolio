import type { Capability } from './schema';

/**
 * "What I Build" — engineering areas.
 * evidence: 'professional' (paid work) | 'academic' (university / hackathon) | 'exploring' (learning)
 */
export const capabilities: Capability[] = [
  {
    id: 'firmware',
    title: 'Embedded Firmware & RTOS',
    icon: 'Microchip',
    summary: 'The code that runs on the device itself.',
    detail:
      'Firmware for smart-home products on ESP32, ESP8266 and Nuvoton — RTOS tasks for sensing, control and communication, debugged on real hardware with the hardware team.',
    technologies: ['Embedded C', 'C++', 'RTOS', 'ESP32', 'Nuvoton'],
    evidence: ['professional'],
    relatedProjects: ['smart-home-iot-hub'],
  },
  {
    id: 'connectivity',
    title: 'Connected Devices',
    icon: 'Wifi',
    summary: 'Switches, buses and a hub that ties them together.',
    detail:
      'Wi-Fi smart switches with peripherals on UART, I2C, SPI and GPIO, and a Matter-based hub in progress to connect them with voice-assistant ecosystems.',
    technologies: ['Wi-Fi', 'UART', 'I2C', 'SPI', 'Matter (in progress)'],
    evidence: ['professional'],
    relatedProjects: ['smart-home-iot-hub'],
  },
  {
    id: 'lighting',
    title: 'Lighting Control',
    icon: 'Lightbulb',
    summary: 'Four different ways to say "50% brightness".',
    detail: 'Dimming controllers built at PAT IoT Solutions: Phase-Cut, PWM, DALI and analog. Try the explainer.',
    technologies: ['Phase-Cut', 'PWM', 'DALI', 'Analog dimming'],
    evidence: ['professional'],
    relatedProjects: ['smart-home-iot-hub'],
    demo: 'dimming',
  },
  {
    id: 'research',
    title: 'Research & AI',
    icon: 'Network',
    summary: 'Busy networks, cameras that see, and new AI tools.',
    detail:
      'FQ-CoDel for IoT traffic over Wi-Fi in NS-3, real-time detection with OpenCV and YOLO, and AI-assisted development with Claude.',
    technologies: ['NS-3', 'FQ-CoDel', 'OpenCV', 'YOLO', 'Claude AI'],
    evidence: ['academic', 'exploring'],
    relatedProjects: ['fq-codel-iot-wifi', 'smart-surveillance'],
  },
  {
    id: 'web',
    title: 'Web Interfaces',
    icon: 'MonitorSmartphone',
    summary: 'Interfaces people actually see.',
    detail: 'Designed and deployed the PAT IoT Solutions company website alongside my firmware role.',
    technologies: ['HTML', 'CSS', 'Responsive UI', 'Deployment'],
    evidence: ['professional'],
    relatedProjects: ['pat-iot-website'],
  },
];
