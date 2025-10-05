import express from 'express';
import cors from 'cors';
import { analyzeCompany } from './pipeline.js';

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: '1mb' }));

app.post('/api/analyze-company', async (req, res) => {
  const { company } = (req.body ?? {}) as { company?: string };
  if (!company || company.trim().length < 2) {
    res.status(400).json({ error: 'company_required' });
    return;
  }
  try {
    const result = await analyzeCompany(company.trim());
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'analyze_failed', message: String(err?.message ?? err) });
  }
});

const PORT = Number(process.env.PORT || 3001);
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Scraper API listening on http://localhost:${PORT}`);
});
