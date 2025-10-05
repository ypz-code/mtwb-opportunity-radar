Prereqs
- Node.js 18 or 20
- Internet access (to fetch public pages, PDFs, and Wikipedia API)

Dev run
1) Install deps: `npm i` (run at repo root)
2) Start scraper API: `npm run dev -w server` (serves http://localhost:3001)
3) Start web client: `npm run dev -w client` (serves http://localhost:5173)
4) Open http://localhost:5173

Production run (localhost)
1) Build server: `npm run build -w server`
2) Start server: `npm run start -w server` (http://localhost:3001)
3) Build client: `npm run build -w client`
4) Preview client: `npm run preview -w client` (prints URL, default http://localhost:4173)

Notes
- Free sources only: official sites, their sitemaps, PDFs, Wikipedia pages. No paid search APIs.
- Robots.txt respected. Concurrency capped. PDFs limited to 15 MB.
- Client expects API at http://localhost:3001. Change `client/src/api/analyze.ts` if you host elsewhere.
