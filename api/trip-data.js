import { put, head } from '@vercel/blob';

// Single shared trip stored under one fixed blob path. If you ever want
// to host multiple trips from the same deployment, the easiest change
// is to key this off a query param (e.g. ?trip=cancun) instead of one
// fixed path — ask if you'd like that added.
const BLOB_PATH = 'trip-data.json';

async function readTrip() {
  try {
    const info = await head(BLOB_PATH, { token: process.env.BLOB_READ_WRITE_TOKEN });
    const res = await fetch(info.url, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    // head() throws a NotFoundError when the blob doesn't exist yet — that's
    // expected on first-ever load, not a real problem. Anything else, log it
    // so it shows up in Vercel's function logs for debugging.
    if (!(err && (err.name === 'BlobNotFoundError' || /not.*found/i.test(String(err.message))))) {
      console.error('Unexpected error reading trip blob', err);
    }
    return null;
  }
}

async function writeTrip(data) {
  await put(BLOB_PATH, JSON.stringify(data), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
    token: process.env.BLOB_READ_WRITE_TOKEN
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    res.status(500).json({
      error: 'BLOB_READ_WRITE_TOKEN is not set. This usually means no Blob store is connected to this project yet, or the project hasn\'t been redeployed since connecting one. Go to Storage → Create Database → Blob, connect it to this project, then redeploy.'
    });
    return;
  }

  if (req.method === 'GET') {
    try {
      const data = await readTrip();
      res.status(200).json(data);
    } catch (err) {
      console.error('Blob read error', err);
      res.status(500).json({ error: 'Failed to read trip data: ' + (err && err.message ? err.message : String(err)) });
    }
    return;
  }

  if (req.method === 'POST') {
    try {
      await writeTrip(req.body);
      res.status(200).json({ ok: true });
    } catch (err) {
      console.error('Blob write error', err);
      res.status(500).json({ error: 'Failed to save trip data: ' + (err && err.message ? err.message : String(err)) });
    }
    return;
  }

  res.status(405).send('Method not allowed');
}
