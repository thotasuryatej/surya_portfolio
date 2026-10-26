// Prints resume-source/resume.html to two PDFs with a local Chromium-based browser (Edge by default):
//   public/resume/Surya-Tej-Resume.pdf  — served by the site, phone number hidden
//   resume-source/Surya-Tej-Resume-full.pdf — for direct applications, includes the phone number
// The original résumé in the project root is never touched.
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const src = pathToFileURL(resolve('resume-source/resume.html')).href;
const outputs = [
  { file: 'public/resume/Surya-Tej-Resume.pdf', publicCopy: true },
  { file: 'resume-source/Surya-Tej-Resume-full.pdf', publicCopy: false },
];

const browser = await chromium.launch({ channel: process.env.RESUME_BROWSER ?? 'msedge' });
const page = await browser.newPage();
await page.goto(src);
for (const o of outputs) {
  await page.evaluate((p) => document.body.classList.toggle('public', p), o.publicCopy);
  await page.pdf({ path: o.file, format: 'Letter', preferCSSPageSize: true, printBackground: true });
  console.log('wrote', o.file);
}
await browser.close();
