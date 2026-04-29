# EZRATE

On-chain event review MVP for Solana devnet.

EZRATE lets event organizers create a review page, whitelist attendee emails exported from Luma, and collect tamper-resistant ratings. The MVP keeps discovery, comments, and whitelist checks off-chain, while the Solana program stores event counters and immutable review commitments.

## Monorepo

```text
programs/ezrate/   Quasar Solana program
web/               Next.js app, API routes, Reown AppKit integration
```

## MVP Architecture

- On-chain: event account, review account, rating, comment hash, reviewer identity hash, duplicate prevention with PDA seeds.
- Backend: Next.js API routes. For the pitch MVP this reads/writes JSON in `web/data`. Swap this for Turso, Neon, Supabase, or Upstash before production.
- Frontend: one Next.js app with host-aware homepages.
  - `ezrate.fun` renders the landing page.
  - `app.ezrate.fun` renders the mobile app view.
  - Local fallback routes: `/` for landing, `/app` for app view.
- Login/wallet: Reown AppKit Solana adapter. The UI is wired for AppKit and keeps email capture explicit for the MVP because Google identity verification depends on your Reown Cloud/Auth configuration.

## Quick Start

```bash
cd /Users/ulinnuha.eth/ezratesol/web
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000` for the landing page and `http://localhost:3000/app` for the app view.

## Deploy Online

Use [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md) for a step-by-step Vercel deployment guide.

## Supabase

Use [SUPABASE.md](./SUPABASE.md) and [supabase/schema.sql](./supabase/schema.sql) when moving the MVP from local JSON/browser storage to hosted persistence.

## Solana Program

```bash
cd /Users/ulinnuha.eth/ezratesol/programs/ezrate
quasar build
quasar test
```

The program id in `src/lib.rs` is a placeholder. Generate and deploy your devnet program id before using this in a live demo.

## Pitch Demo Flow

1. Organizer opens the app view and creates an event with max reviews and a Luma email whitelist.
2. Attendee opens `/event/solana-builder-night`, connects with Reown, enters the same email, and submits a rating plus a 100+ character review.
3. API checks whitelist and duplicate status, hashes the email/comment, and records the pending review commitment.
4. Solana relayer integration submits the commitment to the Quasar program on devnet.

## Production Notes

- Replace `web/data/*.json` with a hosted database.
- Configure Reown project ID and Google/social login in Reown Cloud.
- Add a relayer key management service for fee-sponsored reviews.
- Store only hashes or content-addressed review bodies on-chain. Do not store email addresses on-chain.
