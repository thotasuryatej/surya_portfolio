// Dev-only inspection: screenshots at several widths + console errors + horizontal overflow.
// Usage: node scripts/inspect.mjs <url> <outDir> [dark|light]
import { chromium } from 'playwright-core';
const [url = 'http://localhost:5173/', out = 'shots', theme = 'dark'] = process.argv.slice(2);
const browser = await chromium.launch({ channel: 'msedge' });
const widths = [360, 390, 768, 1280, 1920];
for (const w of widths) {
  const page = await browser.newPage({ viewport: { width: w, height: w < 800 ? 800 : 900 } });
  await page.addInitScript((t) => localStorage.setItem('theme', t), theme);
  const errors = [];
  page.on('console', (m) => (m.type() === 'error' || m.type() === 'warning') && errors.push(`${m.type()}: ${m.text()}`));
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${out}/hero-${w}-${theme}.png` });
  // Scroll through so whileInView reveals fire
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 400) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(60);
  }
  await page.waitForTimeout(900);
  const overflow = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const bad = [];
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (r.right > vw + 1 && r.width > 0 && getComputedStyle(el).position !== 'fixed') bad.push(`${el.tagName}.${el.className?.baseVal ?? el.className} right=${Math.round(r.right)}`);
    }
    return { scrollW: document.documentElement.scrollWidth, vw, bad: bad.slice(0, 10) };
  });
  // Full-page capture stretches the viewport; render skipped sections so they are not blank
  await page.addStyleTag({ content: 'main > .section { content-visibility: visible !important }' });
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${out}/full-${w}-${theme}.png`, fullPage: true });
  console.log(JSON.stringify({ w, height: h, overflow, errors: errors.slice(0, 10) }));
  await page.close();
}
await browser.close();
