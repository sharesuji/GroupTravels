import { kv } from '@vercel/kv';

// Single shared trip stored under one key. If you ever want to host
// multiple trips from the same deployment, the easiest change is to
// key this off a query param (e.g. ?trip=cancun) instead of one
// fixed key — ask if you'd like that added.
const TRIP_KEY = 'trip-data';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      const data = await kv.get(TRIP_KEY);
      res.status(200).json(data || null);
    } catch (err) {
      console.error('KV get error', err);
      res.status(500).json({ error: 'Failed to read trip data' });
    }
    return;
  }

  if (req.method === 'POST') {
    try {
      await kv.set(TRIP_KEY, req.body);
      res.status(200).json({ ok: true });
    } catch (err) {
      console.error('KV set error', err);
      res.status(500).json({ error: 'Failed to save trip data' });
    }
    return;
  }

  res.status(405).send('Method not allowed');
}
