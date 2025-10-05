export function normalize(s: string): string {
  return s.normalize('NFC').toLowerCase().replace(/\s+/g, ' ').trim();
}

export function tokenize(s: string): string[] {
  return normalize(s).split(/[^a-z0-9]+/).filter(Boolean);
}

export function simpleStem(token: string): string {
  return token.replace(/(ing|ed|es|s)$/i, '');
}

export function csvEscapeCell(cell: string): string {
  const dangerous = /^[=+\-@;]/;
  let value = cell;
  if (dangerous.test(value)) value = "'" + value;
  const mustQuote = /[",\r\n]/.test(value);
  if (mustQuote) value = '"' + value.replace(/"/g, '""') + '"';
  return value;
}
