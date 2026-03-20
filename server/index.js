import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { closePool, query } from './db.js';

const app = express();
const PORT = Number(process.env.API_PORT || 4000);

app.use(cors());
app.use(express.json());

app.get('/api/health', async (_req, res) => {
  try {
    await query('SELECT 1');
    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, error: 'Database unavailable' });
  }
});

app.get('/api/instruments', async (req, res) => {
  const limit = Number(req.query.limit || 50);
  try {
    const result = await query(
      `SELECT id, name, category, frequency_hz, mood, audio_url, image_url, description, created_at
       FROM instruments
       ORDER BY id ASC
       LIMIT $1`,
      [limit],
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch instruments' });
  }
});

app.get('/api/instruments/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: 'Invalid id' });
    return;
  }

  try {
    const result = await query(
      `SELECT id, name, category, frequency_hz, mood, audio_url, image_url, description, created_at
       FROM instruments
       WHERE id = $1`,
      [id],
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Instrument not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch instrument' });
  }
});

app.post('/api/instruments', async (req, res) => {
  const { name, category, frequency_hz, mood, audio_url, image_url, description } = req.body;

  if (!name || !category) {
    res.status(400).json({ error: 'name and category are required' });
    return;
  }

  try {
    const result = await query(
      `INSERT INTO instruments (name, category, frequency_hz, mood, audio_url, image_url, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, category, frequency_hz, mood, audio_url, image_url, description, created_at`,
      [name, category, frequency_hz ?? null, mood ?? null, audio_url ?? null, image_url ?? null, description ?? null],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create instrument' });
  }
});

const server = app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});

async function shutdown(signal) {
  console.log(`Received ${signal}. Shutting down...`);
  server.close(async () => {
    await closePool();
    process.exit(0);
  });
}

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});
