import type { Education, Job } from './schema';

/** Newest first. To add a new job, add an object at the top and set the previous one's `end`. */
export const jobs: Job[] = [
  {
    company: 'PAT IoT Solutions',
    role: 'Embedded Software Developer',
    location: 'Hyderabad, India',
    period: { start: '2025-09', end: 'present' },
    website: 'https://patiot.in/',
    logo: { src: '/images/companies/pat-iot-solutions.webp', alt: 'PAT IoT Solutions logo', source: 'https://patiot.in/images/logo.png' },
    summary:
      'End-to-end embedded firmware for smart-home automation products, and a Matter-based IoT hub in development.',
    points: [
      'Firmware for smart-home automation products on ESP32, ESP8266 and Nuvoton microcontrollers.',
      'Wi-Fi-enabled smart switches and dimming controllers supporting Phase-Cut, PWM, DALI and analog dimming.',
      'Building an IoT hub using the Matter protocol to connect home-automation devices with Alexa, Siri and Google Assistant (in progress).',
      'RTOS-based embedded architectures, communication protocols and device integration workflows.',
      'Firmware debugging, hardware–software integration and real-time device communication.',
      'Designed and deployed the PAT IoT Solutions website using Claude AI for UI development, deployment and workflow integration.',
      'Collaborating with hardware, firmware and product teams on connected automation products.',
    ],
    technologies: ['ESP32', 'ESP8266', 'Nuvoton', 'RTOS', 'Matter', 'Embedded C', 'HTML/CSS'],
  },
  {
    company: 'CSR Electronologies',
    role: 'Firmware Engineer Intern',
    location: 'Hyderabad, India',
    period: { start: '2025-05', end: '2025-09' },
    website: 'https://www.csre.in/',
    logo: { src: '/images/companies/csr-electronologies.webp', alt: 'CSR Electronologies logo', source: 'https://www.csre.in/images/logo.jpeg' },
    summary: 'Embedded firmware and RTOS-based IoT projects for smart-home devices.',
    points: [
      'Firmware for smart-home automation devices, including Wi-Fi-enabled switches and real-time control systems.',
      'Communication interfaces and peripheral integration using UART, I2C, SPI and GPIO.',
      'RTOS task management, device scheduling and real-time embedded application development.',
      'Developed and tested automation workflows for connected IoT devices.',
      'Built, tested and deployed firmware with Arduino IDE and PlatformIO.',
      'Worked with hardware and firmware teams through prototyping, integration and validation.',
    ],
    technologies: ['ESP32', 'ESP8266', 'RTOS', 'UART', 'I2C', 'SPI', 'GPIO', 'PlatformIO'],
  },
];

export const education: Education[] = [
  {
    institution: 'Kakatiya Institute of Technology and Science',
    degree: 'B.Tech in Computer Science Engineering (Internet of Things)',
    location: 'Warangal, India',
    period: { start: '2021-11', end: '2025' },
    grade: 'CGPA 7.03 / 10',
  },
];
