import type { MindsetStep } from './schema';

export const mindsetIntro =
  'Tony Stark builds the future out of almost nothing — imagine it, learn what it takes, make it work. That is why Iron Man inspires me, and why this core is my own arc reactor. Six habits power it; pick one to see where I have used it.';

export const mindset: MindsetStep[] = [
  {
    title: 'Discover the problem',
    short: 'Discover',
    text: 'Understand who it is for and what actually needs to change before writing code.',
    icon: 'Compass',
    example: {
      project: 'smart-microgrid',
      text: 'SIH 2023 started from a real need: seeing how energy is generated, distributed and consumed.',
    },
  },
  {
    title: 'Research & learn',
    short: 'Research',
    text: 'Learn whatever is necessary — a protocol, a framework, a datasheet — even if it is unfamiliar.',
    icon: 'BookOpen',
    example: {
      project: 'smart-home-iot-hub',
      text: 'Learning the Matter protocol to build an interoperable smart-home hub.',
    },
  },
  {
    title: 'Design the architecture',
    short: 'Design',
    text: 'Decide how the pieces fit: tasks, interfaces, data flow and failure points.',
    icon: 'Workflow',
    example: {
      project: 'smart-home-iot-hub',
      text: 'RTOS-based firmware architecture for connected switches and dimmers.',
    },
  },
  {
    title: 'Build a prototype',
    short: 'Prototype',
    text: 'Get something real working early, then let it teach me what the design missed.',
    icon: 'Hammer',
    example: {
      project: 'smart-surveillance',
      text: 'Combined OpenCV and YOLO into a real-time detection prototype for webcam and CCTV feeds.',
    },
  },
  {
    title: 'Test, debug, understand failures',
    short: 'Debug',
    text: 'Treat every failure as information about how the system really behaves.',
    icon: 'Bug',
    example: {
      project: 'smart-home-iot-hub',
      text: 'Firmware debugging and hardware–software integration across real devices.',
    },
  },
  {
    title: 'Improve & document',
    short: 'Improve',
    text: 'Measure, refine and write down what I learned so the next build starts further ahead.',
    icon: 'FileText',
    example: {
      project: 'fq-codel-iot-wifi',
      text: 'Evaluated latency, throughput and congestion in NS-3 to refine queue management.',
    },
  },
];
