export type Factor = { id: string; name: string; desc: string; weight: number; keywords: string[]; };
export type CategoryKey = 'build' | 'thrive' | 'sustain' | 'keystone';
export type Taxonomy = Record<CategoryKey, Factor[]>;
export type CategoryWeights = Record<CategoryKey, number>;

export type RawCompanyData = {
  name: string;
  phillyHQ?: boolean;
  eaglesPartner?: boolean;
  mtwbPartner?: boolean;
  corpus: string;
  evidence: Array<{ factorId: string; url?: string; title?: string; snippet: string; publishedAt?: string }>;
};

export type FactorScore = {
  factorId: string;
  factorName: string;
  category: CategoryKey;
  weight: number;
  score: number;
  citations: Array<{ url?: string; title?: string; publishedAt?: string }>;
};

export type CompanyResult = {
  name: string;
  scores: { build: number; thrive: number; sustain: number; keystone: number; overall: number; };
  tier: 'High Alignment' | 'Moderate Alignment' | 'Low Alignment';
  dataAvailability: number;
  factorScores: FactorScore[];
  phillyBased: boolean;
  eaglesPartner: boolean;
  keystoneLabel: 'Strong Local Alignment' | 'Moderate Local Ties' | 'Limited Local Connection';
};

export type ProgressEvent =
  | { kind: 'start'; company: string }
  | { kind: 'step'; company: string; message: string }
  | { kind: 'done'; company: string }
  | { kind: 'error'; company: string; message: string };
