import type { CompanyResult } from '../types';
import { csvEscapeCell } from './text';

export function toCSV(results: CompanyResult[]): string {
  const header = [
    'Company','Overall','Build (35%)','Thrive (35%)','Sustain (20%)','Keystone (10%)','Tier','Local Connection','Data %'
  ];
  const rows = results.map((r) => [
    r.name,
    r.scores.overall.toFixed(1),
    r.scores.build.toFixed(1),
    r.scores.thrive.toFixed(1),
    r.scores.sustain.toFixed(1),
    r.scores.keystone.toFixed(1),
    r.tier,
    r.keystoneLabel,
    String(r.dataAvailability),
  ]);
  const csv = [header, ...rows]
    .map((row) => row.map((c) => csvEscapeCell(String(c))).join(','))
    .join('\n');
  return '\uFEFF' + csv; // BOM for Excel
}

export function downloadCSV(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
