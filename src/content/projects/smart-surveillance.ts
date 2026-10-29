import { defineProject } from '../schema';

export default defineProject({
  slug: 'smart-surveillance',
  title: 'Smart and Sustainable Surveillance',
  short: 'Smart Surveillance',
  category: 'AI & Vision',
  summary:
    'Real-time object detection, face recognition and motion detection on webcam and CCTV feeds, with a monitoring interface for event tracking.',
  status: 'Completed',
  period: { start: '2024-03' },
  role: 'Developer — detection pipeline and monitoring interface',
  technologies: ['Python', 'OpenCV', 'YOLO', 'Computer vision'],
  order: 7,
  visual: 'vision',
  diagram: 'vision-pipeline',
  overview: [
    'Conventional CCTV records everything and relies on someone watching. This project explored making surveillance smarter: detecting objects, faces and motion automatically so attention goes only where something is happening.',
    'I combined OpenCV and YOLO with multiple datasets for real-time detection on webcam and CCTV feeds, and built a monitoring interface to visualise detections and track events.',
  ],
  highlights: [
    'Object detection, face recognition and motion detection.',
    'Real-time webcam and CCTV-based detection workflows.',
    'Monitoring interface for surveillance visualisation and event tracking.',
    'AI-assisted techniques to improve automation and monitoring efficiency.',
  ],
  note: 'Illustrations on this page are synthetic. No real surveillance footage is published.',
});
