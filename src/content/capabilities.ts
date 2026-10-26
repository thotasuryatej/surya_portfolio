import type { Capability } from './schema';

/**
 * "What I Build" — engineering areas.
 * evidence: 'professional' (paid work) | 'academic' (university / hackathon) | 'exploring' (learning)
 */
export const capabilities: Capability[] = [
  {
    id: 'firmware',
    title: 'Embedded Firmware',
    icon: 'Microchip',
    summary: 'The code that runs on the device itself.',
    detail:
      'End-to-end firmware for smart-home products on ESP32, ESP8266 and Nuvoton MS51 microcontrollers — from peripheral drivers to device behaviour — built and flashed with Arduino IDE and PlatformIO.',
    technologies: ['Embedded C', 'C', 'C++', 'ESP32', 'ESP8266', 'Nuvoton MS51', 'Arduino IDE', 'PlatformIO'],
    evidence: ['professional'],
    relatedProjects: ['smart-home-iot-hub'],
  },
  {
    id: 'rtos',
    title: 'RTOS & Real-Time Systems',
    icon: 'Timer',
    summary: 'Many jobs, one small chip, strict timing.',
    detail:
      'RTOS-based architectures where tasks for sensing, control and communication share a microcontroller. Work includes task management, device scheduling and real-time communication between devices.',
    technologies: ['RTOS', 'Task scheduling', 'Real-time communication'],
    evidence: ['professional'],
    relatedProjects: ['smart-home-iot-hub'],
  },
  {
    id: 'connectivity',
    title: 'IoT Connectivity',
    icon: 'Wifi',
    summary: 'Getting devices, chips and networks to talk.',
    detail:
      'On-board buses (UART, I2C, SPI, GPIO) to connect peripherals, Wi-Fi for device connectivity, and ongoing work with the Matter protocol for interoperability between smart-home ecosystems.',
    technologies: ['Wi-Fi', 'UART', 'I2C', 'SPI', 'GPIO', 'Matter (in progress)'],
    evidence: ['professional'],
    relatedProjects: ['smart-home-iot-hub'],
  },
  {
    id: 'smart-home',
    title: 'Smart-Home Automation',
    icon: 'House',
    summary: 'Switches, dimmers and a hub that ties them together.',
    detail:
      'Wi-Fi-enabled smart switches and dimming controllers for lighting automation, plus a Matter-based IoT hub in development to connect home-automation devices with voice-assistant ecosystems.',
    technologies: ['Smart switches', 'Dimming controllers', 'IoT hub', 'Matter'],
    evidence: ['professional'],
    relatedProjects: ['smart-home-iot-hub'],
  },
  {
    id: 'lighting',
    title: 'Lighting Control',
    icon: 'Lightbulb',
    summary: 'Four different ways to say "50% brightness".',
    detail:
      'Built at PAT IoT Solutions: dimming controllers supporting Phase-Cut, PWM, DALI and analog dimming. Each technique controls light output differently — try the interactive explainer below.',
    technologies: ['Phase-Cut', 'PWM', 'DALI', 'Analog dimming'],
    evidence: ['professional'],
    relatedProjects: ['smart-home-iot-hub'],
    demo: 'dimming',
  },
  {
    id: 'integration',
    title: 'Hardware–Software Integration',
    icon: 'Cable',
    summary: 'Where firmware meets real circuits.',
    detail:
      'Firmware debugging, circuit debugging and hardware testing alongside hardware and product teams through prototyping, integration and validation.',
    technologies: ['Firmware debugging', 'Circuit debugging', 'Prototyping', 'Hardware testing', 'System testing'],
    evidence: ['professional'],
    relatedProjects: ['smart-home-iot-hub'],
  },
  {
    id: 'networks',
    title: 'Network Research',
    icon: 'Network',
    summary: 'How IoT traffic behaves when the network gets busy.',
    detail:
      'Fair-queuing congestion control (FQ-CoDel) for IoT traffic in Wi-Fi networks, simulated in NS-3 and visualised in NetAnim to study latency, throughput and congestion.',
    technologies: ['NS-3', 'NetAnim', 'FQ-CoDel', 'Queue management'],
    evidence: ['academic'],
    relatedProjects: ['fq-codel-iot-wifi'],
  },
  {
    id: 'web',
    title: 'Web Interfaces',
    icon: 'MonitorSmartphone',
    summary: 'Interfaces people actually see.',
    detail:
      'Designed and deployed the PAT IoT Solutions company website — responsive UI, product information structure and deployment — beyond my core embedded role.',
    technologies: ['HTML', 'CSS', 'Responsive UI', 'Deployment'],
    evidence: ['professional'],
    relatedProjects: ['pat-iot-website'],
  },
  {
    id: 'ai',
    title: 'AI & Experiments',
    icon: 'Sparkles',
    summary: 'Using AI as a tool — and learning how it works.',
    detail:
      'Computer vision with OpenCV and YOLO and machine-learning-based energy analytics in academic projects; AI-assisted development with Claude at work. New AI tools and models are logged in the Learning Lab as I explore them.',
    technologies: ['Python', 'OpenCV', 'YOLO', 'Machine learning', 'Claude AI'],
    evidence: ['academic', 'professional', 'exploring'],
    relatedProjects: ['smart-surveillance', 'smart-microgrid', 'pat-iot-website'],
  },
];
