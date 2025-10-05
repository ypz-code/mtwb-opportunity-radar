import type { CompanyResult } from '../types';

export function CompanyCard({ data }: { data: CompanyResult }) {
  return (
    <div className="border border-gray-200 rounded-lg p-5" role="group" aria-label={`Result for ${data.name}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-gray-900">{data.name}</h3>
            {data.phillyBased && <span aria-label="Philadelphia HQ" className="text-amber-700 text-xs font-semibold">PHL</span>}
            {data.eaglesPartner && <span aria-label="Eagles Partner" className="text-green-700 text-xs font-semibold">Eagles</span>}
          </div>
          <div className="flex gap-2 mt-2 flex-wrap">
            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
              data.tier === 'High Alignment' ? 'bg-green-100 text-green-800' :
              data.tier === 'Moderate Alignment' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>{data.tier}</span>
            <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
              {data.keystoneLabel}
            </span>
            <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-800">
              Data {data.dataAvailability}%
            </span>
          </div>
        </div>
        <div className="text-right ml-4">
          <div className="text-4xl font-bold text-indigo-600">{data.scores.overall.toFixed(1)}</div>
          <div className="text-xs text-gray-500">Strategic Score</div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-4">
        {(['build','thrive','sustain','keystone'] as const).map((k) => (
          <div key={k} className="bg-gray-50 p-3 rounded">
            <div className="text-xs text-gray-600 font-semibold mb-1 flex items-center justify-between uppercase">
              <span>{k}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {data.scores[k].toFixed(1)}
            </div>
          </div>
        ))}
      </div>

      <details className="mt-2">
        <summary className="text-sm font-semibold text-gray-700">Evidence and factor breakdown</summary>
        <div className="mt-2 grid md:grid-cols-2 gap-3">
          {data.factorScores.map((f) => (
            <div key={`${f.category}-${f.factorId}`} className="text-xs bg-white border rounded p-2">
              <div className="flex items-start justify-between">
                <div className="font-medium">{f.factorName} <span className="text-gray-500">({f.category})</span></div>
                <div className="font-bold">{f.score}</div>
              </div>
              {f.citations.length > 0 && (
                <ul className="list-disc pl-4 mt-1">
                  {f.citations.map((c, i) => (
                    <li key={i}>
                      <a className="underline text-indigo-700 break-all" href={c.url} rel="noreferrer noopener" target="_blank">
                        {c.title ?? c.url}
                      </a>
                      {c.publishedAt && <span className="text-gray-500"> — {new Date(c.publishedAt).toISOString().slice(0,10)}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
