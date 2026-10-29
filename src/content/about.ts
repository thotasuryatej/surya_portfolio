import type { AboutContent } from './schema';

export const about: AboutContent = {
  title: 'Built on curiosity',
  intro: [
    "I'm an embedded developer, and I love building products. Right now I write firmware for smart-home devices at PAT IoT Solutions in Hyderabad, and I'm always up for building something new.",
    'I like the point where hardware and software meet: getting a microcontroller, a radio, a power stage and a few thousand lines of C to behave as one reliable product. Getting there means reading datasheets, debugging, and learning whatever the problem needs.',
  ],
  // Taken from the second intro paragraph, so the long version still reads in full
  statement: 'I like the point where hardware and software meet.',
  more: [
    "I don't want to learn only what's familiar. When a new tool, protocol or AI capability looks useful, I want to understand how it works and try building something with it. That's how I ended up building my company's website with Claude AI alongside my firmware work.",
    'The inventors I admire share a few habits: they imagine something that does not exist yet, learn the technology underneath it, prepare for difficult situations, and build their own tools instead of only talking about ideas. That is the kind of engineer I am working to become.',
  ],
  glance: [
    { icon: 'Microchip', label: 'Microcontrollers', items: ['ESP32', 'ESP8266', 'Nuvoton MS51'] },
    { icon: 'Cable', label: 'Integration', items: ['Firmware debug', 'Circuit debug', 'HW testing'] },
    { icon: 'Network', label: 'Connectivity', items: ['Matter', 'Wi-Fi', 'UART', 'I2C', 'SPI'] },
    { icon: 'Timer', label: 'Real-time', items: ['RTOS tasks', 'Scheduling', 'Device comms'] },
    { icon: 'Code', label: 'Languages', items: ['Embedded C', 'C++17', 'Python'] },
    { icon: 'Trophy', label: 'Recognition', items: ['SIH 2023 finalist', 'Grand Contest 2024'] },
  ],
};
