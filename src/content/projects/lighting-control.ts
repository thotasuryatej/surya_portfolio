import { defineProject } from '../schema';

// Part of my work on the smart-home products at PAT IoT Solutions (see smart-home-iot-hub).
// The descriptions of each technique are general background; the animation is illustrative, not measured.
export default defineProject({
  slug: 'lighting-control',
  title: 'Lighting Control — Four Dimming Techniques',
  short: 'Lighting Control',
  category: 'Embedded & IoT',
  summary:
    'Firmware for smart-home dimming controllers that set brightness four different ways: Phase-Cut, PWM, DALI and analog.',
  status: 'Completed',
  period: { start: '2025' },
  updated: '2026-11',
  role: 'Embedded software developer — dimming firmware for the smart-home products',
  technologies: ['Embedded C', 'Phase-Cut', 'PWM', 'DALI', 'Analog 0–10 V'],
  order: 1.2,
  visual: 'lighting',
  diagram: 'dimming',
  overview: [
    'Lights in a home are not all dimmed the same way. A mains lamp, an LED strip and a commercial light fitting each expect a different kind of signal, so a smart dimmer has to speak the right one.',
    'As part of the Smart Home Automation & IoT Hub work at PAT IoT Solutions, I wrote firmware for dimming controllers that support four techniques. Try each one in the explainer below: move the slider and watch the signal change.',
  ],
  sections: [
    {
      heading: 'The four techniques',
      body: ['Four different ways to say “50% brightness”:'],
      bullets: [
        'Phase-Cut: mains AC is switched on partway through each half-cycle; the later it switches on, the dimmer the lamp.',
        'PWM: the LED is switched fully on and off very quickly; the share of time it is on sets the brightness you see.',
        'DALI: a digital lighting-control protocol (IEC 62386) that sends addressed level commands over a two-wire bus.',
        'Analog: a DC control voltage sets the level; in the common 0–10 V scheme, a higher voltage means a brighter light.',
      ],
    },
  ],
  related: ['smart-home-iot-hub'],
  note: 'Product names, internal designs and code belong to PAT IoT Solutions, so this describes the engineering at a high level. The animation is an illustration, not a measurement.',
});
