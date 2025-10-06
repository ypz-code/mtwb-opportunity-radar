import got from 'got';
import { URL } from 'node:url';
import { XMLParser } from 'fast-xml-parser';
const parser = new XMLParser({ ignoreAttributes: false });

const WIKI_API = 'https://en.wikipedia.org/w/api.php';

async function wikiSearchPage(title: string): Promise<any | null> {
  const params = new URL(WIKI_API);
  params.searchParams.set('action', 'query');
  params.searchParams.set('format', 'json');
  params.searchParams.set('prop', 'extlinks|info');
  params.searchParams.set('inprop', 'url');
  params.searchParams.set('titles', title);
  params.searchParams.set('redirects', '1');
  try {
    const json = await got(params, { timeout: { request: 8000 } }).json<any>();
    const pages = json?.query?.pages ?? {};
    const first = Object.values(pages)[0] as any;
    return first ?? null;
  } catch {
    return null;
  }
}

export async function discoverOfficialSite(company: string): Promise<string | null> {
  let page = await wikiSearchPage(company);
  if (!page || page.missing) page = await wikiSearchPage(`${company} (company)`);
  if (!page || page.missing) return null;

  const ext = (page.extlinks ?? []) as Array<{ '*': string }>;
  const site = ext.map(e => e['*']).find(u =>
    /^https?:\/\/[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i.test(u) &&
    !/^(https?:\/\/)?(facebook|twitter|linkedin|instagram)\.com/i.test(u)
  );
  try {
    if (site) return new URL(site).origin;
  } catch {}
  return null;
}

function candidatePaths(origin: string): string[] {
  const bases = [
    '/sustainability', '/esg', '/impact', '/corporate-responsibility',
    '/responsibility', '/community', '/foundation', '/reports',
    '/sustainability/report', '/esg/report', '/about/sustainability',
    '/investors', '/news'
  ];
  return bases.map(p => origin + p);
}

async function fromSitemap(origin: string): Promise<string[]> {
  const urls = [`${origin}/sitemap.xml`, `${origin}/sitemap_index.xml`];
  const out: string[] = [];
  for (const u of urls) {
    try {
      const xml = await got(u, { timeout: { request: 8000 } }).text();
      const doc = parser.parse(xml);
      const locs: string[] = []
        .concat(doc.urlset?.url ?? [])
        .concat(doc.sitemapindex?.sitemap ?? [])
        .map((n: any) => n.loc ?? n?.url?.loc)
        .filter(Boolean);
      for (const loc of locs) {
        if (typeof loc === 'string') out.push(loc);
      }
    } catch {}
  }
  return out;
}

export async function discoverCandidateUrls(company: string, officialOrigin: string | null): Promise<string[]> {
  const targets = new Set<string>();

  if (officialOrigin) {
    candidatePaths(officialOrigin).forEach(u => targets.add(u));
    const sm = await fromSitemap(officialOrigin);
    for (const u of sm) {
      if (/\.(pdf)$/i.test(u) || /(sustainab|esg|impact|responsib|community|philanthropy|report|csr)/i.test(u)) {
        targets.add(u);
      }
    }
  }

  const wiki = await wikiSearchPage(company);
  if (wiki?.fullurl) targets.add(wiki.fullurl);

  return Array.from(targets)
    .filter(u => !/\.(jpg|jpeg|png|gif|mp4|zip)$/i.test(u))
    .slice(0, 20);
}
