import React, { useCallback, useMemo, useRef, useState } from 'react';
import { TrendingUp, Database, Download, RefreshCw, Search } from 'lucide-react';
import { MethodologyPanel } from './MethodologyPanel';
import { CompanyCard } from './components/CompanyCard';
import { collectCompanyRaw, runAnalysis } from './analysis';
import { aggregateCompany } from './scoring';
import type { CompanyResult, ProgressEvent } from './types';
import { toCSV, downloadCSV } from './utils/csv';

export default function MTWBRadarApp() {
  const [companies, setCompanies] = useState('');
  const [showWeights, setShowWeights] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<string[]>([]);
  const [results, setResults] = useState<CompanyResult[] | null>(null);
  const [filter, setFilter] = useState<'all'|'high'|'moderate'|'low'>('all');
  const abortRef = useRef<AbortController | null>(null);

  const onProgress = useCallback((ev: ProgressEvent) => {
    console.log(ev);
    setProgress(p => {
      const line =
        ev.kind === 'step' ? `${ev.company}: ${ev.message}` :
        ev.kind === 'start' ? `${ev.company}: started` :
        ev.kind === 'done' ? `${ev.company}: done` :
        `${ev.company}: error: ${ev.message}`;
      const next = [...p, line];
      if (next.length > 500) next.shift();
      return next;
    });
  }, []);

  const run = useCallback(async () => {
    if (loading) return;
    setProgress([]);
    setResults(null);
    setLoading(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const names = companies.split('\n').map(s => s.trim()).filter(Boolean);
      const rawList = await runAnalysis(names, { signal: ctrl.signal, onProgress }, collectCompanyRaw);
      const aggregated: CompanyResult[] = rawList.map(aggregateCompany).sort((a,b)=>b.scores.overall-a.scores.overall);
      setResults(aggregated);
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }, [companies, loading, onProgress]);

  const cancel = useCallback(() => abortRef.current?.abort(), []);
  const filtered = useMemo(() =>
    results?.filter(r =>
      filter === 'all' ? true :
      filter === 'high' ? r.tier === 'High Alignment' :
      filter === 'moderate' ? r.tier === 'Moderate Alignment' :
      r.tier === 'Low Alignment'
    ) ?? null, [results, filter]);

  const exportCSV = useCallback(() => {
    if (!results) return;
    const csv = toCSV(results);
    downloadCSV('mtwb_analysis.csv', csv);
  }, [results]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <TrendingUp className="text-indigo-600" size={36} aria-hidden />
                MTWB Opportunity Radar
              </h1>
              <p className="text-gray-600 mt-1 flex items-center gap-2">
                <Database size={16} className="text-green-600" aria-hidden />
                Free On-Site Scraper • Two-Tier Framework
              </p>
            </div>
            <div className="text-right">
              <button onClick={()=>setShowWeights(v=>!v)} className="mt-2 text-xs text-indigo-600 hover:text-indigo-800" aria-expanded={showWeights} aria-controls="methodology">
                {showWeights ? 'Hide' : 'Show'} Methodology
              </button>
            </div>
          </div>

          {showWeights && <div id="methodology"><MethodologyPanel /></div>}

          <div className="mb-6">
            <label htmlFor="companies" className="block text-sm font-semibold text-gray-700 mb-2">Enter Companies (one per line)</label>
            <textarea id="companies" value={companies} onChange={e=>setCompanies(e.target.value)} placeholder={`Comcast Corporation\nThe Home Depot\nPatagonia\nTarget Corporation\nStarbucks`} className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"/>
            <div className="mt-2 text-xs text-gray-500">Scraper uses official sites, sitemaps, PDFs, and Wikipedia. No paid search APIs.</div>
          </div>

          <div className="flex gap-2">
            <button onClick={run} disabled={!companies.trim() || loading} className="bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2" aria-busy={loading}>
              {loading ? <RefreshCw className="animate-spin" size={20} aria-hidden /> : <Search size={20} aria-hidden />}
              {loading ? 'Analyzing…' : 'Run Analysis'}
            </button>
            <button onClick={cancel} disabled={!loading} className="bg-gray-100 text-gray-800 py-3 px-4 rounded-lg font-semibold disabled:bg-gray-200">Cancel</button>
            <button onClick={exportCSV} disabled={!results || results.length===0} className="bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 flex items-center gap-2">
              <Download size={18} aria-hidden /> Export CSV
            </button>
          </div>

          {loading && progress.length>0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg max-h-64 overflow-y-auto" role="status" aria-live="polite">
              <div className="text-xs font-semibold text-gray-700 mb-2">Progress</div>
              {progress.slice(-200).map((line,i)=><div key={i} className="text-xs text-gray-600">{line}</div>)}
            </div>
          )}
        </div>

        {filtered && (
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Database size={24} className="text-green-600" aria-hidden />
                Results
              </h2>
              <div className="flex gap-2">
                {(['all','high','moderate','low'] as const).map(k=>(
                  <button key={k} onClick={()=>setFilter(k)} className={`px-3 py-2 rounded-lg text-sm font-medium ${k===filter?'bg-indigo-600 text-white':'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} aria-pressed={k===filter}>
                    {k==='all'?'All':`${k[0].toUpperCase()}${k.slice(1)} Alignment`}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {filtered.map(r => <CompanyCard key={r.name} data={r} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
