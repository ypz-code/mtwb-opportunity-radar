import type { CategoryWeights, Taxonomy } from './types';

export const CATEGORY_WEIGHTS: CategoryWeights = {
  build: 0.35, thrive: 0.35, sustain: 0.20, keystone: 0.10
};

export const TAXONOMY: Taxonomy = {
  build: [
    { id: 'playground', name: 'Playground Payout', desc: 'Capital investment in public spaces', weight: 0.30, keywords: ['community investment','capital projects','public spaces','infrastructure','park','playground'] },
    { id: 'vendor', name: 'MTWB Vendor Synergy', desc: 'Revitalization project alignment', weight: 0.30, keywords: ['building materials','construction','hardware','led','safety equipment','sustainable materials'] },
    { id: 'sourcing', name: 'Hyperlocal Sourcing Index', desc: 'Local supply chain spending', weight: 0.15, keywords: ['supplier diversity','local suppliers','small business','local procurement','regional sourcing'] },
    { id: 'talent', name: 'Zoning for Talent', desc: 'Local hiring initiatives', weight: 0.15, keywords: ['local hiring','community hiring','workforce development','local employment','neighborhood jobs'] },
    { id: 'fabric', name: 'Community Fabric Score', desc: 'Community bond strengthening', weight: 0.10, keywords: ['community','local banking','home improvement','connectivity','neighborhood'] }
  ],
  thrive: [
    { id: 'empowerment', name: 'Empowerment Multiplier', desc: 'Skills training & incubation', weight: 0.35, keywords: ['skills training','workforce development','financial literacy','small business incubation','education programs','apprenticeship'] },
    { id: 'civic', name: 'Civic Leadership Index', desc: 'Leadership civic involvement', weight: 0.25, keywords: ['board member','non-profit','civic','community leadership','volunteer leadership','philanthropy'] },
    { id: 'accessibility', name: 'Main Street Accessibility', desc: 'Product affordability', weight: 0.20, keywords: ['affordable','accessible','pricing','low-income','assistance program','subsidy'] },
    { id: 'workforce', name: 'Holistic Workforce Investment', desc: 'Employee well-being investment', weight: 0.10, keywords: ['mental health','childcare','education benefits','wellness','employee benefits','paid leave'] },
    { id: 'sweat', name: 'Sweat Equity Rate', desc: 'Employee volunteer engagement', weight: 0.10, keywords: ['volunteer','community service','employee volunteering','volunteer hours','service hours'] }
  ],
  sustain: [
    { id: 'water', name: 'Water Table Integrity', desc: 'Water stewardship impact', weight: 0.40, keywords: ['water','wastewater','water usage','water conservation','water stewardship','watershed'] },
    { id: 'secondlife', name: 'Second-Life Loop', desc: 'Circular economy practices', weight: 0.40, keywords: ['circular economy','recycling','take-back','refurbishment','product lifecycle','waste reduction'] },
    { id: 'commute', name: 'Green Commute Score', desc: 'Sustainable transportation support', weight: 0.20, keywords: ['public transit','ev charging','bike','commute','transportation','carpool'] }
  ],
  keystone: [
    { id: 'ecosystem', name: 'MTWB Ecosystem', desc: 'Existing partnership with MTWB/similar orgs', weight: 0.50, keywords: ['make the world better','mtwb','connor barwin','philadelphia non-profit','community revitalization'] },
    { id: 'philly', name: 'Philadelphia Footprint', desc: 'HQ in Philadelphia metro area', weight: 0.35, keywords: ['philadelphia','philly','pa','pennsylvania'] },
    { id: 'eagles', name: 'The Eagles Nest', desc: 'Partnership with Philadelphia Eagles', weight: 0.15, keywords: ['philadelphia eagles','eagles partner','nfl','lincoln financial field'] }
  ]
};
