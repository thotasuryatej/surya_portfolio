// Validates everything in src/content. Usage: npm run validate
// Uses Vite's module loader so `import.meta.glob` in the content index works exactly as on the site.
import { createServer } from 'vite';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const server = await createServer({
  root,
  configFile: false,
  logLevel: 'error',
  server: { middlewareMode: true, hmr: false, ws: false },
  appType: 'custom',
  optimizeDeps: { noDiscovery: true, include: [] },
});

let failed = false;
try {
  const { validateContent } = await server.ssrLoadModule('/src/content/validate.ts');
  const content = await server.ssrLoadModule('/src/content/index.ts');
  const issues = validateContent((p) => existsSync(resolve(root, 'public', '.' + decodeURI(p))));

  const errors = issues.filter((i) => i.level === 'error');
  const warnings = issues.filter((i) => i.level === 'warning');
  for (const i of warnings) console.warn(`  ⚠  ${i.where}: ${i.message}`);
  for (const i of errors) console.error(`  ✖  ${i.where}: ${i.message}`);

  console.log(
    `\nContent: ${content.projects.length} projects, ${content.labEntries.length} lab entries, ` +
      `${content.articles.length} articles, ${content.jobs.length} jobs.`,
  );
  if (errors.length) {
    failed = true;
    console.error(`✖ ${errors.length} error(s), ${warnings.length} warning(s). Fix the errors above.`);
  } else {
    console.log(`✔ Content is valid${warnings.length ? ` (${warnings.length} warning(s))` : ''}.`);
  }
} catch (e) {
  failed = true;
  console.error('✖ Could not load content — usually a syntax error in a content file:\n', e);
} finally {
  await server.close();
}
process.exit(failed ? 1 : 0);
