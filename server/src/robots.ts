import got from 'got';
import { URL } from 'node:url';
import robotsParser from 'robots-parser';

const robotsCache = new Map<string, ReturnType<typeof robotsParser>>();

export async function robotsTxtAllows(target: string): Promise<boolean> {
  try {
    const u = new URL(target);
    const key = u.origin;
    let parser = robotsCache.get(key);
    if (!parser) {
      const robotsUrl = `${u.protocol}//${u.host}/robots.txt`;
      const txt = await got(robotsUrl, { timeout: { request: 5000 } }).text();
      parser = robotsParser(robotsUrl, txt);
      robotsCache.set(key, parser);
    }
    return parser.isAllowed(target, 'MTWB-Scraper/1.0') ?? true;
  } catch {
    return true;
  }
}
