import type { HeroContent } from './schema';

export const hero: HeroContent = {
  eyebrow: ['Embedded Software Developer', 'IoT Engineer', 'Builder'],
  title: 'I love turning ideas into things that work.',
  accent: 'things that work.',
  lead:
    "I'm Surya Tej, an embedded software developer who builds connected systems, explores emerging technologies, and enjoys bringing ambitious ideas to life — from firmware and IoT to new experiments with AI.",
  now: 'Currently building a Matter-based IoT hub at PAT IoT Solutions.',
  primaryAction: { label: 'Explore my builds', href: '#projects' },
  secondaryAction: { label: 'About me', href: '#about' },

  // The interactive nodes around the core. Keep these to things I have actually worked on.
  // `icon` is a Lucide icon name. Up to 8 nodes fit the layout.
  nodes: [
    {
      id: 'mcu',
      label: 'Microcontrollers',
      icon: 'Cpu',
      detail: 'Firmware for ESP32, ESP8266 and Nuvoton MS51 microcontrollers in smart-home products.',
      evidence: 'professional',
    },
    {
      id: 'rtos',
      label: 'RTOS',
      icon: 'Timer',
      detail: 'RTOS-based architectures: task management, scheduling and real-time device communication.',
      evidence: 'professional',
    },
    {
      id: 'integration',
      label: 'Hardware bring-up',
      icon: 'Cable',
      detail: 'Firmware debugging, circuit debugging and hardware testing alongside the hardware and product teams.',
      evidence: 'professional',
    },
    {
      id: 'matter',
      label: 'Matter hub',
      icon: 'Router',
      detail: 'In progress: an IoT hub using the Matter protocol, aimed at working with Alexa, Siri and Google Assistant.',
      evidence: 'professional',
    },
    {
      id: 'wifi',
      label: 'Wi-Fi devices',
      icon: 'Wifi',
      detail: 'Wi-Fi-enabled smart switches and peripherals wired up over UART, I2C, SPI and GPIO.',
      evidence: 'professional',
    },
    {
      id: 'network',
      label: 'Network research',
      icon: 'Network',
      detail: 'FQ-CoDel fair queuing for IoT traffic over Wi-Fi, simulated and analysed in NS-3.',
      evidence: 'academic',
    },
    {
      id: 'vision',
      label: 'Computer vision',
      icon: 'ScanEye',
      detail: 'Real-time object and motion detection with OpenCV and YOLO for a smart surveillance system.',
      evidence: 'academic',
    },
    {
      id: 'ai',
      label: 'AI workflows',
      icon: 'Sparkles',
      detail: 'Used Claude AI to design and deploy the PAT IoT Solutions website. Now exploring where AI fits into how I build.',
      evidence: 'exploring',
    },
  ],
};
