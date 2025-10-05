export function MethodologyPanel() {
  return (
    <div className="mb-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
      <h3 className="font-bold text-indigo-900 mb-2">Two-Tier Strategic Weighting System</h3>
      <p className="text-sm text-gray-700 mb-3">
        Tier 1: Category weights reflect mission priorities (Build & Thrive = 70% combined).<br />
        Tier 2: Factor weights reflect tactical importance.<br />
        Data: Heuristic scoring from scraped HTML/PDF text plus Wikipedia, weighted by provenance and recency.
      </p>
      <div className="grid grid-cols-4 gap-2 text-xs mt-3">
        <div className="bg-white p-2 rounded border-2 border-blue-400"><span className="font-bold text-blue-800">BUILD: 35%</span></div>
        <div className="bg-white p-2 rounded border-2 border-purple-400"><span className="font-bold text-purple-800">THRIVE: 35%</span></div>
        <div className="bg-white p-2 rounded border-2 border-green-400"><span className="font-bold text-green-800">SUSTAIN: 20%</span></div>
        <div className="bg-white p-2 rounded border-2 border-amber-400"><span className="font-bold text-amber-800">KEYSTONE: 10%</span></div>
      </div>
    </div>
  );
}
