import { CATEGORY_WEIGHTS, TAXONOMY } from './constants';
import type { CategoryKey, CompanyResult, FactorScore, RawCompanyData } from './types';
import { normalize, simpleStem, tokenize } from './utils/text';

function provenanceWeight(url?: string): number {
  if (!url) return 0.5;
  try {
    const host = new URL(url).hostname;
    if (/sec\.gov$/i.test(host)) return 1.0;
    if (/(ft|wsj|bloomberg)\.com$/i.test(host)) return 0.85;
    if (/(nytimes|reuters|apnews|washingtonpost)\.com$/i.test(host)) return 0.8;
    if (/^[a-z0-9.-]+\.com$/i.test(host)) return 0.6;
  } catch {}
  return 0.5;
}

function recencyWeight(publishedAt?: string): number {
  if (!publishedAt) return 0.7;
  const now = Date.now();
  const t = Date.parse(publishedAt);
  if (Number.isNaN(t)) return 0.7;
  const months = (now - t) / (1000 * 60 * 60 * 24 * 30.4375);
  const halfLife = 18;
  return Math.pow(0.5, months / halfLife);
}

function scoreFactor(corpus: string, keywords: string[], snippets: Array<{url?: string; title?: string; publishedAt?: string; snippet: string}>): { raw: number; citations: FactorScore['citations'] } {
  const text = normalize(corpus);
  const toks = tokenize(text).map(simpleStem);

  let hits = 0;
  const seen = new Set<string>();

  for (const kw of keywords) {
    const phrase = normalize(kw);
    if (text.includes(phrase)) {
      if (!seen.has(phrase)) { hits += 1; seen.add(phrase); }
    } else {
      const parts = phrase.split(' ').map(simpleStem).filter(Boolean);
      const found = parts.every(p => toks.includes(p));
      if (found && !seen.has(phrase)) { hits += 0.5; seen.add(phrase); }
    }
  }

  const base = Math.min(1, hits * 0.25);
  const cites = snippets.slice(0,3).map(s => ({ url: s.url, title: s.title, publishedAt: s.publishedAt }));
  const quality = snippets.slice(0,3).reduce((acc, s) => acc + provenanceWeight(s.url) * recencyWeight(s.publishedAt), 0) / Math.max(1, Math.min(3, snippets.length));
  const raw = Math.round(100 * base * (0.6 + 0.4 * quality));
  return { raw, citations: cites };
}

function evidenceFor(raw: RawCompanyData, kws: string[]) {
  const out: Array<{url?: string; title?: string; publishedAt?: string; snippet: string}> = [];
  for (const ev of raw.evidence) {
    if (kws.some(k => normalize(ev.snippet).includes(normalize(k)))) {
      out.push({ url: ev.url, title: ev.title, publishedAt: ev.publishedAt, snippet: ev.snippet });
    }
    if (out.length >= 3) break;
  }
  return out;
}

export function aggregateCompany(raw: RawCompanyData): CompanyResult {
  const factorScores: FactorScore[] = [];

  const specials = {
    philly: raw.phillyHQ ? 1 : 0,
    eagles: raw.eaglesPartner ? 1 : 0,
    ecosystem: raw.mtwbPartner ? 1 : 0
  };

  (Object.keys(TAXONOMY) as CategoryKey[]).forEach((cat) => {
    TAXONOMY[cat].forEach((f) => {
      const ev = evidenceFor(raw, f.keywords);
      let score = scoreFactor(raw.corpus, f.keywords, ev).raw;

      if (cat === 'keystone') {
        if (f.id === 'philly' && specials.philly) score = 100;
        if (f.id === 'eagles' && specials.eagles) score = 100;
        if (f.id === 'ecosystem' && specials.ecosystem) score = 100;
      }
      if (cat === 'build' && f.id === 'vendor') {
        const name = normalize(raw.name);
        if (/(home depot|lowe)/.test(name)) score = Math.max(score, 85);
      }

      factorScores.push({
        factorId: f.id,
        factorName: f.name,
        category: cat,
        weight: f.weight,
        score,
        citations: ev.slice(0,3).map(s => ({ url: s.url, title: s.title, publishedAt: s.publishedAt })),
      });
    });
  });

  const catScore = (cat: CategoryKey) => {
    const total = TAXONOMY[cat].reduce((acc, f) => acc + f.weight, 0);
    const s = factorScores.filter(fs => fs.category === cat).reduce((acc, fs) => acc + (fs.score/100)*fs.weight, 0);
    return Math.round(100 * (s / total));
  };

  const build = catScore('build');
  const thrive = catScore('thrive');
  const sustain = catScore('sustain');
  const keystone = catScore('keystone');
  const overall = Math.round(
    (build * CATEGORY_WEIGHTS.build) +
    (thrive * CATEGORY_WEIGHTS.thrive) +
    (sustain * CATEGORY_WEIGHTS.sustain) +
    (keystone * CATEGORY_WEIGHTS.keystone)
  * 10) / 10;

  const available = factorScores.filter(f => f.score > 0).length;
  const totalFactors = factorScores.length;
  const dataAvailability = Math.round(100 * available / totalFactors);

  const tier: CompanyResult['tier'] = overall >= 75 ? 'High Alignment' : overall >= 50 ? 'Moderate Alignment' : 'Low Alignment';
  const keystoneLabel: CompanyResult['keystoneLabel'] =
    keystone > 50 ? 'Strong Local Alignment' : keystone > 25 ? 'Moderate Local Ties' : 'Limited Local Connection';

  return {
    name: raw.name,
    scores: { build, thrive, sustain, keystone, overall },
    tier,
    dataAvailability,
    factorScores,
    phillyBased: !!raw.phillyHQ,
    eaglesPartner: !!raw.eaglesPartner,
    keystoneLabel
  };
}
