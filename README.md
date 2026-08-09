# Trip Tracker — Vercel version

Same shared trip tracker (people, flights, hotels, expenses + settle-up),
now backed by a Vercel Serverless Function + Vercel KV instead of Claude's
storage. No Claude account needed for anyone using it.

## What's here

```
index.html          # the whole app (frontend) — served as-is at the root
api/trip-data.js     # GET/POST serverless function, backed by Vercel KV
package.json         # declares the @vercel/kv dependency
```

No `vercel.json` needed — Vercel auto-detects the root `index.html` as a
static site and `api/trip-data.js` as a serverless function at
`/api/trip-data`, which is exactly what the frontend calls.

## One-time setup: create a KV store

1. In the Vercel dashboard, open your project (or create it first by
   deploying once — see below).
2. Go to **Storage → Create Database → KV** (Upstash-backed).
3. Once created, click **Connect Project** and link it to this project.
   Vercel automatically injects the env vars (`KV_REST_API_URL`,
   `KV_REST_API_TOKEN`, etc.) — nothing to copy/paste by hand.
4. Redeploy after connecting so the function picks up the new env vars.

## Deploy

**Option A — Vercel CLI**

```bash
npm install -g vercel
cd trip-tracker-vercel
vercel --prod
```

The first run will ask you to link/create a project — do that, then go
set up the KV store (above) and redeploy with `vercel --prod` again.

**Option B — Git**

1. Push this folder to a GitHub repo.
2. In the Vercel dashboard: **New Project → Import** that repo → Deploy.
3. Set up the KV store as above, then redeploy (Vercel redeploys
   automatically on the next push, or you can trigger one manually from
   the dashboard).

## How the data works

- Everything (trip name, travelers, flights, hotels, expenses) lives
  under one key (`trip-data`) in your Vercel KV store.
- The frontend calls `GET /api/trip-data` on load and `POST /api/trip-data`
  every time something changes, with automatic retries if a save fails.
- This is **one trip per deployment**. To run multiple trips from one
  deployed site, the simplest change is to key storage off a URL param
  (e.g. `?trip=cancun`) inside `api/trip-data.js` — ask if you want that
  added.

## Notes

- No login, no access control — anyone with the deployed URL can view
  and edit the trip. Treat the link like a shared doc.
- The in-app screenshot-reading feature from the Claude-artifact version
  isn't included here, to keep this dependency-free. Adding it back would
  mean a separate serverless function that calls the Anthropic API with
  your own server-side API key (never exposed to the browser) — say the
  word if you'd like that wired up.
