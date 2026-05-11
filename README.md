# EZRATE

On-chain event reviews for Solana.

EZRATE is a post-event trust and reputation layer for Web3 communities. Organizers create review campaigns, verify attendee eligibility, and collect tamper-resistant ratings. Eligibility checks and UX live in the web app, while the Solana program stores event-level counters and immutable review commitments.

## Monorepo

```text
programs/ezrate/   Quasar Solana program
web/               Next.js app, API routes, Reown AppKit integration
```

## Architecture

- On-chain: event id/account, review commitment hash, rating record, timestamp, and anti-duplicate nullifier via PDA seeds.
- Backend: Next.js API routes. The current local build reads/writes JSON in `web/data`; production persistence should use Supabase, Turso, Neon, or Upstash.
- Frontend: one Next.js app with host-aware homepages.
  - `ezrate.fun` renders the landing page.
  - `app.ezrate.fun` renders the regular user review app.
  - `create.ezrate.fun` renders the desktop event organizer portal.
  - `app.ezrate.fun/[username]` renders a public organizer profile.
  - Local fallback routes: `/` for landing, `/app` for user app, `/create` for organizer portal.
- Login/wallet: Reown AppKit Solana adapter with Google, X, and Discord social onboarding support.

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

Use [SUPABASE.md](./SUPABASE.md) and [supabase/schema.sql](./supabase/schema.sql) when moving local JSON/browser storage to hosted persistence.

## Solana Program

```bash
cd /Users/ulinnuha.eth/ezratesol/programs/ezrate
quasar build
quasar test
```

The program id in `src/lib.rs` is a placeholder. Generate and deploy your devnet program id before using this in a live demo.

### Sponsored Review Fees

The Quasar program is designed for gasless reviewer UX:

- The event organizer prepays SOL into the event account when creating an event.
- The reviewer still signs the review transaction, but does not need SOL.
- The EZRATE relayer is the Solana transaction fee payer.
- After a valid review is recorded, the program reimburses the relayer from the event's prepaid SOL balance.

This matches Solana's fee model: programs cannot pay the network fee before execution, so a relayer must submit the transaction. The on-chain prepaid balance makes the relayer economically covered by the organizer.

## Pitch Demo Flow

1. Organizer opens the desktop portal, registers company name and username once, then creates an event review campaign.
2. Attendee opens `/event/solana-builder-night`, signs in (wallet/social), completes eligibility check (allowlist/passcode/check-in), and submits one rating + short review.
3. API checks eligibility + duplicate status, hashes reviewer identity/comment, and records a pending review commitment.
4. Solana relayer submits the commitment on-chain so the event has auditable, tamper-resistant proof.

## Production Notes

- Replace `web/data/*.json` with a hosted database.
- Configure Reown project ID and Google/social login in Reown Cloud.
- Add a relayer key management service for fee-sponsored reviews.
- Store only hashes or content-addressed review bodies on-chain. Do not store email addresses on-chain.
