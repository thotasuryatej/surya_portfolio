/**
 * ARTICLE TEMPLATE — copy, rename to `<your-slug>.ts`, fill in.
 * The Writing section appears automatically once at least one article exists.
 */
import { defineArticle } from '../schema';

export default defineArticle({
  slug: 'my-first-article',
  title: 'Article title',
  summary: 'What the reader will learn.',
  date: '2026-11-01',
  tags: ['Embedded'],
  href: 'https://www.linkedin.com/pulse/...', // or a PDF in /public, e.g. '/writing/my-article.pdf'
});
