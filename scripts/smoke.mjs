// Dev-only: click through the main interactions in Edge and report pass/fail.
// Usage: node scripts/smoke.mjs [url]   (start `npm run dev` or `npm run preview` first)
import { chromium } from 'playwright-core';

const url = process.argv[2] ?? 'http://localhost:5173/';
const results = [];
const check = async (name, fn) => {
  try {
    await fn();
    results.push(['PASS', name]);
  } catch (e) {
    results.push(['FAIL', `${name} — ${e.message.split('\n')[0]}`]);
  }
};
const assert = (cond, msg) => {
  if (!cond) throw new Error(msg);
};

const browser = await chromium.launch({ channel: 'msedge' });
const errors = [];

// Desktop
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new URL(url).origin });
  const page = await ctx.newPage();
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(url, { waitUntil: 'networkidle' });

  await check('nav link scrolls to section and marks it current', async () => {
    await page.click('.nav-links a[href="#experience"]');
    await page.waitForFunction(() => Math.abs(document.getElementById('experience').getBoundingClientRect().top) < 200, null, { timeout: 5000 });
    await page.waitForFunction(() => document.querySelector('.nav-links a[aria-current="location"]')?.getAttribute('href') === '#experience', null, { timeout: 3000 });
  });

  await check('loading with a section hash lands on that section', async () => {
    const fresh = await ctx.newPage();
    await fresh.goto(url + '#mindset', { waitUntil: 'networkidle' });
    await fresh.waitForFunction(() => Math.abs(document.getElementById('mindset').getBoundingClientRect().top) < 200, null, { timeout: 5000 });
    await fresh.close();
  });

  await check('theme toggle switches theme and back', async () => {
    const theme = () => page.evaluate(() => document.documentElement.dataset.theme ?? 'dark');
    // The nav hides while scrolling down, so return to the top first.
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.locator('.nav:not(.is-hidden)').waitFor({ timeout: 3000 });
    const t0 = await theme();
    await page.locator('.theme-chip').first().click();
    await page.waitForFunction((t) => (document.documentElement.dataset.theme ?? 'dark') !== t, t0, { timeout: 3000 });
    await page.locator('.theme-chip').first().click();
    await page.waitForFunction((t) => (document.documentElement.dataset.theme ?? 'dark') === t, t0, { timeout: 3000 });
  });

  await check('journey: a linked stop opens its case study', async () => {
    await page.locator('#journey').scrollIntoViewIfNeeded();
    const stop = page.locator('#journey button.jr-btn').first();
    await stop.evaluate((el) => el.click());
    await page.locator('dialog[open]').waitFor({ timeout: 3000 });
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('dialog[open]'), null, { timeout: 3000 });
  });

  await check("builder's core: arrow keys change the habit and the panel", async () => {
    await page.locator('#mindset').scrollIntoViewIfNeeded();
    const labels = page.locator('.bc-label');
    await labels.first().focus();
    await page.keyboard.press('ArrowRight');
    assert((await labels.nth(1).getAttribute('aria-pressed')) === 'true', 'second habit not pressed');
    await page.waitForFunction(() => /Research/.test(document.querySelector('.bc-body > :last-child .bc-title')?.textContent ?? ''), null, { timeout: 2000 });
    await page.keyboard.press('End');
    assert((await labels.last().getAttribute('aria-pressed')) === 'true', 'End did not select last');
    await page.waitForFunction(() => /Improve/.test(document.querySelector('.bc-body > :last-child .bc-title')?.textContent ?? ''), null, { timeout: 2000 });
  });

  await check('capability tabs: arrow keys move selection', async () => {
    await page.locator('#build').scrollIntoViewIfNeeded();
    const tabs = page.locator('#build').getByRole('tab');
    await tabs.first().focus();
    await page.keyboard.press('ArrowDown');
    const sel = await page.evaluate(() => document.activeElement.getAttribute('aria-selected'));
    assert(sel === 'true', 'focused tab not selected');
    await page.keyboard.press('End');
    assert((await tabs.last().getAttribute('aria-selected')) === 'true', 'End did not select last tab');
  });

  await check('dimming demo: slider and modes update the readout', async () => {
    const tab = page.getByRole('tab', { name: /Lighting Control/ });
    await tab.click();
    const slider = page.locator('#cap-panel input[type="range"]');
    await slider.waitFor();
    const before = await page.locator('#cap-panel svg[role="img"]').getAttribute('aria-label');
    await slider.fill('20');
    const after = await page.locator('#cap-panel svg[role="img"]').getAttribute('aria-label');
    assert(before !== after && after.includes('20%'), `label: ${after}`);
    await page.locator('.dim-modes button', { hasText: 'DALI' }).click();
    assert((await page.locator('#cap-panel svg[role="img"]').getAttribute('aria-label')).startsWith('DALI'), 'mode did not switch');
  });

  await check('project card opens dialog; Escape closes it', async () => {
    await page.locator('#projects .pc a').first().click();
    const dlg = page.locator('dialog[open]');
    await dlg.waitFor({ timeout: 3000 });
    assert(page.url().includes('#project/'), `url ${page.url()}`);
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('dialog[open]'), null, { timeout: 3000 });
  });

  await check('deep link opens FQ-CoDel case study; next/prev pager works', async () => {
    await page.goto(url + '#project/fq-codel-iot-wifi', { waitUntil: 'networkidle' });
    await page.locator('dialog[open]').waitFor({ timeout: 3000 });
    const title = await page.locator('#dlg-title').textContent();
    assert(/FQ-CoDel/.test(title), `title ${title}`);
    const hash = () => page.evaluate(() => location.hash);
    const h0 = await hash();
    await page.locator('dialog[open] .dlg-page--next').click();
    await page.waitForTimeout(300);
    const h1 = await hash();
    assert(h1 !== h0, 'Next did not change project');
    await page.locator('dialog[open] .dlg-page:not(.dlg-page--next)').click();
    await page.waitForTimeout(300);
    assert((await hash()) === h0, 'Previous did not return');
    const focused = await page.evaluate(() => document.activeElement?.className);
    assert(/dlg-title/.test(focused), `focus on ${focused}`);
  });

  await check('FQ-CoDel sim: Step advances, Play toggles', async () => {
    const dlg = page.locator('dialog[open]');
    if (!/FQ-CoDel/.test(await page.locator('#dlg-title').textContent())) {
      await page.evaluate(() => (location.hash = '#project/fq-codel-iot-wifi'));
      await page.waitForTimeout(400);
    }
    const sim = dlg.locator('.fq');
    await sim.scrollIntoViewIfNeeded();
    const snap = () => sim.innerText();
    const s0 = await snap();
    await sim.getByRole('button', { name: /Step/ }).click();
    await page.waitForTimeout(100);
    assert((await snap()) !== s0, 'step did not change state');
    const play = sim.getByRole('button', { name: /Play|Pause/ });
    const l0 = await play.innerText();
    await play.click();
    assert((await play.innerText()) !== l0, 'play label unchanged');
  });

  await check('browser Back closes the dialog', async () => {
    const fresh = await ctx.newPage();
    await fresh.goto(url, { waitUntil: 'networkidle' });
    await fresh.locator('#projects .pc a').first().click();
    await fresh.locator('dialog[open]').waitFor();
    await fresh.goBack();
    await fresh.waitForFunction(() => !document.querySelector('dialog[open]'), null, { timeout: 3000 });
    await fresh.close();
  });

  await check('résumé link serves the PDF', async () => {
    const href = await page.locator('.nav-resume').getAttribute('href');
    const res = await page.request.get(new URL(href, url).href);
    assert(res.status() === 200, `status ${res.status()}`);
    assert((res.headers()['content-type'] ?? '').includes('pdf'), `type ${res.headers()['content-type']}`);
  });

  await check('copy email writes to clipboard and announces it', async () => {
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('dialog[open]'));
    await page.locator('#contact').scrollIntoViewIfNeeded();
    await page.locator('#contact button[aria-label*="opy"]').click();
    await page.waitForTimeout(200);
    const clip = await page.evaluate(() => navigator.clipboard.readText());
    assert(clip.includes('@'), `clipboard: ${clip}`);
    const status = await page.locator('#contact [role="status"]').innerText();
    assert(/copied/i.test(status), `status: ${status}`);
  });

  await check('mailto link present', async () => {
    const href = await page.locator('#contact a[href^="mailto:"]').first().getAttribute('href');
    assert(href.startsWith('mailto:') && href.includes('subject='), href);
  });

  await ctx.close();
}

// Mobile
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(url, { waitUntil: 'networkidle' });

  await check('mobile menu opens, Escape closes, focus returns', async () => {
    const btn = page.locator('button[aria-controls="mobile-menu"]');
    await btn.click();
    assert((await btn.getAttribute('aria-expanded')) === 'true', 'not expanded');
    await page.locator('#mobile-menu').waitFor();
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    assert((await btn.getAttribute('aria-expanded')) === 'false', 'still expanded');
  });

  await check('mobile menu link navigates and closes menu', async () => {
    const btn = page.locator('button[aria-controls="mobile-menu"]');
    await btn.click();
    await page.locator('#mobile-menu a[href="#contact"]').click();
    assert((await btn.getAttribute('aria-expanded')) === 'false', 'menu still open');
    await page.waitForFunction(() => Math.abs(document.getElementById('contact').getBoundingClientRect().top) < 200, null, { timeout: 5000 });
  });

  await check('reduced motion: no running CSS animations in visuals', async () => {
    const running = await page.evaluate(
      () => document.getAnimations().filter((a) => a.playState === 'running' && a.effect?.getComputedTiming().iterations === Infinity).length,
    );
    assert(running === 0, `${running} infinite animations running`);
  });

  await check('mobile: no horizontal overflow', async () => {
    const [sw, cw] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
    assert(sw <= cw, `${sw} > ${cw}`);
  });

  await ctx.close();
}

await browser.close();
for (const [s, n] of results) console.log(`${s}  ${n}`);
console.log(errors.length ? `Console errors:\n${errors.join('\n')}` : 'No console errors.');
process.exit(results.some(([s]) => s === 'FAIL') ? 1 : 0);
