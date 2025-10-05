import { discoverOfficialSite, discoverCandidateUrls } from './sources.js';
import { fetchMany } from './scrape.js';

export type Evidence = {
  factorId: string;
  url: string;
  title?: string;
  snippet: string;
  publishedAt?: string;
};

export type AnalyzeResult = {
  name: string;
  officialSite?: string;
  phillyHQ: boolean;
  eaglesPartner: boolean;
  mtwbPartner: boolean;
  corpus: string;
  evidence: Evidence[];
  count: number;
};

export async function analyzeCompany(name: string): Promise<AnalyzeResult> {
  const official = await discoverOfficialSite(name);
  const seeds = await discoverCandidateUrls(name, official);
  const docs = await fetchMany(seeds, {
    maxConcurrency: 4,
    perDomain: 2,
    timeoutMs: 20000,
    pdfMaxBytes: 15 * 1024 * 1024
  });

  const corpus = docs.map(d => d.content).join('\n');
  const lc = corpus.toLowerCase();

  return {
    name,
    officialSite: official ?? undefined,
    phillyHQ: /\bphiladelphia\b|\bphilly\b/.test(lc),
    eaglesPartner: /\bphiladelphia eagles\b/.test(lc) && /\bpartner|partnership|sponsor/.test(lc),
    mtwbPartner: /\bmake the world better\b|\bmtwb\b/.test(lc),
    corpus,
    evidence: docs.map(d => ({
      factorId: '*',
      url: d.url,
      title: d.title,
      snippet: d.content.slice(0, 1000),
      publishedAt: d.publishedAt
    })),
    count: docs.length
  };
}
