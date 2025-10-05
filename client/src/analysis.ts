import type { ProgressEvent, RawCompanyData } from './types';
import { analyzeCompanyAPI } from './api/analyze';

type RunOptions = {
  signal: AbortSignal;
  onProgress?: (ev: ProgressEvent) => void;
  maxCompanies?: number;
};

export async function collectCompanyRaw(name: string, opts: RunOptions): Promise<RawCompanyData> {
  opts.onProgress?.({ kind: 'start', company: name });
  const data = await analyzeCompanyAPI(name, opts.signal);
  opts.onProgress?.({ kind: 'done', company: name });
  return data;
}

export async function runAnalysis(
  companies: string[],
  opts: RunOptions,
  collect: (name: string, opts: RunOptions) => Promise<RawCompanyData>
) {
  const MAX = opts.maxCompanies ?? 25;
  const list = companies.map((s) => s.trim()).filter(Boolean).slice(0, MAX);

  const results: RawCompanyData[] = [];
  for (const name of list) {
    if (opts.signal.aborted) break;
    try {
      const raw = await collect(name, opts);
      results.push(raw);
    } catch (e: any) {
      opts.onProgress?.({ kind: 'error', company: name, message: String(e?.message || e) });
    }
  }
  return results;
}
