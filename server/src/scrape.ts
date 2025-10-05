import got from 'got';
import { robotsTxtAllows } from './robots.js';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import pdfParse from 'pdf-parse';
import PQueue from 'p-queue';
import path from 'node:path';
import { URL } from 'node:url';

export type Doc = {
  url: string;
  title?: string;
  content: string;
  publishedAt?: string;
};

const cache = new Map<string, Doc>();

export async function fetchMany(urls: string[], opts: {
  maxConcurrency: number;
  perDomain: number;
  timeoutMs: number;
  pdfMaxBytes: number;
}): Promise<Doc[]> {
  const q = new PQueue({ concurrency: opts.maxConcurrency });
  const perDomainCount = new Map<string, number>();
  const res: Doc[] = [];

  const schedule = (url: string) => q.add(async () => {
    try {
      const hostname = new URL(url).hostname;
      const count = perDomainCount.get(hostname) ?? 0;
      if (count >= opts.perDomain) return;
      perDomainCount.set(hostname, count + 1);

      const doc = await fetchOne(url, opts);
      if (doc.content.length >= 300) res.push(doc);
    } catch {}
  });

  urls.forEach(schedule);
  await q.onIdle();
  return dedupeByUrl(res);
}

function dedupeByUrl(items: Doc[]): Doc[] {
  const m = new Map<string, Doc>();
  for (const d of items) m.set(d.url, d);
  return Array.from(m.values());
}

async function fetchOne(url: string, opts: { timeoutMs: number; pdfMaxBytes: number }): Promise<Doc> {
  if (cache.has(url)) return cache.get(url)!;

  if (!(await robotsTxtAllows(url))) throw new Error('robots_disallowed');

  const ext = path.extname(new URL(url).pathname).toLowerCase();
  const out = ext === '.pdf' ? await fetchPDF(url, opts) : await fetchHTML(url, opts);

  cache.set(url, out);
  return out;
}

async function fetchHTML(url: string, opts: { timeoutMs: number }): Promise<Doc> {
  const html = await got(url, {
    timeout: { request: opts.timeoutMs },
    headers: { 'User-Agent': 'MTWB-Scraper/1.0 (+https://example.org/bot)' }
  }).text();

  const dom = new JSDOM(html, { url });
  const doc = dom.window.document;
  const reader = new Readability(doc);
  const article = reader.parse();
  const content = (article?.textContent ?? doc.body.textContent ?? '').replace(/\s+/g, ' ').trim();
  const title = article?.title || doc.title || undefined;

  const publishedAt =
    doc.querySelector('meta[property="article:published_time"]')?.getAttribute('content') ||
    doc.querySelector('time[datetime]')?.getAttribute('datetime') ||
    undefined;

  return { url, title, content, publishedAt };
}

async function fetchPDF(url: string, opts: { timeoutMs: number; pdfMaxBytes: number }): Promise<Doc> {
  const resp = await got(url, {
    timeout: { request: opts.timeoutMs },
    headers: { 'User-Agent': 'MTWB-Scraper/1.0 (+https://example.org/bot)' },
    responseType: 'buffer',
    hooks: {
      beforeRedirect: [
        (options) => {
          options.headers = options.headers ?? {};
          options.headers['User-Agent'] = 'MTWB-Scraper/1.0 (+https://example.org/bot)';
        }
      ]
    }
  });

  const size = Number(resp.headers['content-length'] ?? resp.rawBody.length);
  if (size > opts.pdfMaxBytes) throw new Error('pdf_too_large');

  const data = await pdfParse(resp.rawBody);
  const title = data.info?.Title ? String(data.info.Title) : path.basename(new URL(url).pathname);
  const content = (data.text ?? '').replace(/\s+/g, ' ').trim();

  return { url, title, content };
}
