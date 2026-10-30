import { Cable, Cpu, MessageSquare, Router, SlidersHorizontal, ToggleRight } from 'lucide-react';
import { LegendItem, NodeMap, type MapEdge, type MapNode } from './NodeMap';

// Only what the project description states. Which product uses which microcontroller is not public,
// so the three MCU families are one node rather than wired to specific devices.
const NODES: MapNode[] = [
  { id: 'alexa', label: 'Alexa', icon: MessageSquare, x: 17, y: 10, status: 'progress', detail: 'One of the voice-assistant ecosystems the Matter hub is being built to work with.' },
  { id: 'siri', label: 'Siri', icon: MessageSquare, x: 50, y: 10, status: 'progress', detail: 'One of the voice-assistant ecosystems the Matter hub is being built to work with.' },
  { id: 'google', label: 'Google Assistant', icon: MessageSquare, x: 83, y: 10, status: 'progress', detail: 'One of the voice-assistant ecosystems the Matter hub is being built to work with.' },
  {
    id: 'hub',
    label: 'Matter IoT hub',
    icon: Router,
    x: 50,
    y: 36,
    status: 'progress',
    parts: 'Matter · scalable architecture',
    detail: 'The current focus. Matter is the shared smart-home standard designed so devices can work across ecosystems; the hub connects the existing devices to it.',
  },
  {
    id: 'switch',
    label: 'Wi-Fi smart switches',
    icon: ToggleRight,
    x: 22,
    y: 62,
    status: 'built',
    parts: 'Wi-Fi · input · load control',
    detail: 'Firmware that handles user input, load control and Wi-Fi connectivity at the same time without missing timing-critical events.',
  },
  {
    id: 'dimmer',
    label: 'Dimming controllers',
    icon: SlidersHorizontal,
    x: 78,
    y: 62,
    status: 'built',
    parts: 'Phase-Cut · PWM · DALI · analog',
    detail: 'Lighting dimmers supporting four techniques, because different lamps and fixtures need different control methods.',
  },
  {
    id: 'mcu',
    label: 'RTOS firmware',
    icon: Cpu,
    x: 34,
    y: 89,
    status: 'built',
    parts: 'ESP32 · ESP8266 · Nuvoton · Embedded C',
    detail: 'The products run on three microcontroller families. RTOS-based task management keeps input, load control and communication responsive together.',
  },
  {
    id: 'bus',
    label: 'Peripherals',
    icon: Cable,
    x: 72,
    y: 89,
    status: 'built',
    parts: 'UART · I2C · SPI · GPIO',
    detail: 'The buses that connect the microcontrollers to sensors, drivers and other components on the board.',
  },
];

const EDGES: MapEdge[] = [
  { from: 'hub', to: 'alexa', status: 'progress' },
  { from: 'hub', to: 'siri', status: 'progress' },
  { from: 'hub', to: 'google', status: 'progress' },
  { from: 'switch', to: 'hub', status: 'progress' },
  { from: 'dimmer', to: 'hub', status: 'progress' },
  { from: 'mcu', to: 'switch', status: 'built' },
  { from: 'mcu', to: 'dimmer', status: 'built' },
  { from: 'mcu', to: 'bus', status: 'built' },
];

/** Device topology of the smart-home work: finished firmware below, the Matter hub in progress above. */
export function DeviceTopology() {
  return (
    <NodeMap
      nodes={NODES}
      edges={EDGES}
      initial="hub"
      ratio={0.66}
      label="Smart-home devices and how they connect. Select one to learn about it."
      legend={
        <>
          <LegendItem kind="built">Built</LegendItem>
          <LegendItem kind="progress">In progress</LegendItem>
        </>
      }
      note="A simplified view of the system. Product designs and code belong to PAT IoT Solutions."
    />
  );
}
