import type { RawCompanyData } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3001';

export async function analyzeCompanyAPI(name: string, signal?: AbortSignal): Promise<RawCompanyData> {
  const resp = await fetch(`${API_BASE}/api/analyze-company`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ company: name }),
    signal
  });
  if (!resp.ok) throw new Error(`analyze_${resp.status}`);
  return resp.json() as Promise<RawCompanyData>;
}
