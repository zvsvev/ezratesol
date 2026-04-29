# Supabase Upgrade Plan

The MVP currently uses JSON files for events/reviews and `localStorage` for profile edits. That is fine for pitching, but Supabase is recommended before real users.

## Why Supabase

- Persist user profiles across devices.
- Store organizer-created events safely.
- Store hashed Luma whitelist emails.
- Track reviews, reward eligibility, reward winners, and payout status.
- Add admin/organizer dashboards later without changing the product flow.

## Setup

1. Create a Supabase project.
2. Open the SQL editor.
3. Run `supabase/schema.sql`.
4. Add these environment variables in Vercel:

```text
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=server-only-service-role-key
```

## Suggested Migration Order

1. Move user profile edits from `localStorage` to `profiles`.
2. Move event creation from `web/data/runtime.json` to `events`.
3. Store whitelist entries in `event_whitelist` as email hashes.
4. Store review submissions in `reviews`.
5. Add a scheduled reward job that writes to `rewards` after each review window closes.

Keep the Solana program focused on immutable event/review commitments. Keep private emails and profile data off-chain.
