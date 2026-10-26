// Dev-only: screenshot each section at a given width.
// Usage: node scripts/inspect-sections.mjs <width> <outDir> [url] [dark|light]
import { chromium } from 'playwright-core';
const [w = '1280', out = 'shots', url = 'http://localhost:5173/', theme = 'dark'] = process.argv.slice(2);
const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: Number(w), height: 900 } });
await page.addInitScript((t) => localStorage.setItem('theme', t), theme);
await page.goto(url, { waitUntil: 'networkidle' });
await page.addStyleTag({ content: 'main > .section { content-visibility: visible !important }' });
const h = await page.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < h; y += 400) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(50); }
await page.waitForTimeout(1000);
const ids = await page.evaluate(() => [...document.querySelectorAll('main > section, footer.footer')].map((s) => s.id || 'footer'));
for (const id of ids) {
  const el = id === 'footer' ? page.locator('footer.footer') : page.locator(`#${id}`);
  await el.screenshot({ path: `${out}/${w}-${theme}-${id}.png` });
}
console.log(ids.join(','));
await browser.close();
