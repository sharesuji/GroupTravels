# Trip Tracker — Vercel version

Same shared trip tracker (people, flights, hotels, expenses + settle-up),
backed by a Vercel Serverless Function + Vercel Blob storage instead of
Claude's storage. No Claude account needed for anyone using it.

## What's here

```
index.html          # the whole app (frontend) — served as-is at the root
api/trip-data.js     # GET/POST serverless function, backed by Vercel Blob
package.json         # declares the @vercel/blob dependency
```

No `vercel.json` needed — Vercel auto-detects the root `index.html` as a
static site and `api/trip-data.js` as a serverless function at
`/api/trip-data`, which is exactly what the frontend calls.

## One-time setup: create a Blob store

(Note: Vercel KV was sunset — this project uses **Vercel Blob** instead,
which is still Vercel's own actively-supported storage product.)

1. In the Vercel dashboard, open your project (or create it first by
   deploying once — see below).
2. Go to **Storage → Create Database → Blob**.
3. Once created, click **Connect Project** and link it to this project.
   Vercel automatically injects the `BLOB_READ_WRITE_TOKEN` env var —
   nothing to copy/paste by hand.
4. Redeploy after connecting so the function picks up the new env var.

## Deploy

**Option A — Vercel CLI**

```bash
npm install -g vercel
cd trip-tracker-vercel
vercel --prod
```

The first run will ask you to link/create a project — do that, then go
set up the Blob store (above) and redeploy with `vercel --prod` again.

**Option B — Git**

1. Push this folder to a GitHub repo.
2. In the Vercel dashboard: **New Project → Import** that repo → Deploy.
3. Set up the Blob store as above, then redeploy (push any small change,
   or trigger a redeploy manually from the Deployments tab).

## How the data works

- Everything (trip name, travelers, flights, hotels, expenses) lives
  in one JSON file (`trip-data.json`) in your Vercel Blob store.
- The frontend calls `GET /api/trip-data` on load and `POST /api/trip-data`
  every time something changes, with automatic retries if a save fails.
- This is **one trip per deployment**. To run multiple trips from one
  deployed site, the simplest change is to key storage off a URL param
  (e.g. `?trip=cancun`) inside `api/trip-data.js` — ask if you want that
  added.
- The blob is stored with `access: 'public'`, meaning if someone found
  the exact blob URL they could read the raw JSON directly. This matches
  the rest of the app's model (no login, no access control — the link
  itself is the only thing gating who can see the trip), so it's not a
  new category of risk, just worth knowing.

## Notes

- No login, no access control — anyone with the deployed URL can view
  and edit the trip. Treat the link like a shared doc.
- The in-app screenshot-reading feature from the Claude-artifact version
  isn't included here, to keep this dependency-free. Adding it back would
  mean a separate serverless function that calls the Anthropic API with
  your own server-side API key (never exposed to the browser) — say the
  word if you'd like that wired up.
