import { defineProject } from '../schema';

export default defineProject({
  slug: 'smart-home-iot-hub',
  title: 'Smart Home Automation & IoT Hub',
  short: 'Smart Home Hub',
  category: 'Embedded & IoT',
  summary:
    'Firmware for Wi-Fi smart switches and multi-technique lighting dimmers — and a Matter-based hub to connect them with voice-assistant ecosystems.',
  status: 'In progress',
  period: { start: '2025', end: 'present' },
  updated: '2026-10',
  role: 'Embedded software developer — firmware, RTOS architecture, device integration',
  technologies: ['ESP32', 'ESP8266', 'Nuvoton MS51', 'RTOS', 'Matter', 'Embedded C', 'Wi-Fi', 'PWM', 'DALI'],
  featured: true,
  order: 1,
  visual: 'iot-hub',
  diagram: ['device-topology', 'dimming'],
  overview: [
    'Smart homes are made of many small devices that need to be reliable on their own and work together as a system. This is my main area of professional work: firmware for smart-home automation products built on ESP32, ESP8266 and Nuvoton microcontrollers.',
    'The products include Wi-Fi-enabled smart switches and dimming controllers for lighting automation. The dimmers support four techniques — Phase-Cut, PWM, DALI and analog dimming — because different lamps and fixtures need different control methods.',
    'The current focus is an IoT hub based on the Matter protocol, the smart-home standard designed so devices can work across ecosystems such as Alexa, Siri and Google Assistant.',
  ],
  progress: {
    done: [
      'Firmware for Wi-Fi-enabled smart switches.',
      'Firmware for dimming controllers supporting Phase-Cut, PWM, DALI and analog dimming.',
      'Peripheral integration over UART, I2C, SPI and GPIO.',
      'RTOS-based task management and real-time device communication.',
    ],
    ongoing: [
      'IoT hub using the Matter protocol.',
      'Integration with Alexa, Siri and Google Assistant through the hub.',
      'Embedded architecture for a larger, scalable device ecosystem.',
    ],
  },
  sections: [
    {
      heading: 'What makes it hard',
      body: [
        'A smart switch looks simple, but its firmware has to handle user input, load control, Wi-Fi connectivity and communication with the rest of the system at the same time — without missing timing-critical events. That is why the work leans on RTOS-based architectures, careful debugging and close collaboration with hardware and product teams.',
      ],
    },
  ],
  links: [{ label: 'Hub case study on GitHub', href: 'https://github.com/thotasuryatej/IoT-Matter-Smart-Home-HUB', kind: 'source' }],
  note: 'Product names, internal designs and code belong to PAT IoT Solutions, so this case study describes my role and the engineering at a high level.',
});
