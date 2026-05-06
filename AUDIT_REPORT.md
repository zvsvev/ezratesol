# EZRATE Security & Completeness Audit

Repository: [`zvsvev/ezratesol`](https://github.com/zvsvev/ezratesol)
Branch: `fix/audit-improvement`
Auditor: Senior full-stack & security review
Date: 2026-05-06

> Scope: a non-invasive review of the public MVP. Findings prioritized by
> severity. Only minimal, focused fixes were made on this branch — no
> large refactors, no business-logic rewrites.

---

## 1. Project Overview

EZRATE is an MVP for an on-chain event review layer on Solana devnet. It is a
small monorepo with three components:

| Component | Path | Stack |
| --- | --- | --- |
| Solana program | `programs/ezrate/` | Quasar (Rust, `no_std`), Solana devnet |
| Backend API | `web/app/api/` | Next.js 15 App Router (Node runtime) |
| Frontend | `web/app/`, `web/components/` | Next.js 15 + React 19 + Reown AppKit (Solana adapter) |
| Storage (MVP) | `web/data/*.json`, browser `localStorage` | JSON files (planned migration to Supabase) |

The README explicitly calls out that the MVP uses local JSON for events and
reviews and that production should migrate to Supabase, hash emails off-chain,
and use a relayer key management service. The Solana program ID in
`programs/ezrate/src/lib.rs` is a placeholder.

---

## 2. Components Reviewed

- Next.js API routes: `web/app/api/events/route.ts`, `web/app/api/reviews/route.ts`
- Data store: `web/lib/store.ts`, `web/lib/types.ts`, `web/data/seed.json`
- Frontend pages/components: `web/app/page.tsx`, `web/app/app/page.tsx`,
  `web/app/event/[slug]/page.tsx`, `web/app/layout.tsx`,
  `web/components/AppHome.tsx`, `web/components/ReviewForm.tsx`,
  `web/components/LandingPage.tsx`, `web/context/index.tsx`
- Quasar program: `programs/ezrate/src/lib.rs`,
  `programs/ezrate/src/state/mod.rs`,
  `programs/ezrate/src/instructions/create_event.rs`,
  `programs/ezrate/src/instructions/submit_review.rs`,
  `programs/ezrate/src/events/mod.rs`
- Supabase migration plan: `supabase/schema.sql`, `SUPABASE.md`
- Deploy guide: `DEPLOY_VERCEL.md`
- Env example: `web/.env.example`

The Solana program could not be compiled in this environment because
`quasar-lang` is fetched from a private git host that is not reachable from the
audit VM. The audit therefore reviews the Solana code statically only.

---

## 3. Summary of Findings

| # | Title | Severity | Status on this branch |
| - | --- | --- | --- |
| F1 | No request-body validation on API routes (DoS / type confusion) | High | Fixed |
| F2 | Slug collision lets new events overwrite existing ones | High | Fixed |
| F3 | `rating` accepts non-integer values off-chain | Medium | Fixed |
| F4 | Email format never validated server-side | Medium | Fixed |
| F5 | Empty event name produces empty slug → broken routing | Medium | Fixed |
| F6 | Build fails: `<a href="/">` for internal route in `LandingPage.tsx` | Medium (CI) | Fixed |
| F7 | No ESLint config committed → first run prompts interactively, build fails | Medium (CI) | Fixed |
| F8 | Event creation has no authentication or rate limiting | High | Documented (out of scope for MVP) |
| F9 | Hard-coded backdoor passcode `solananight52` accepted unconditionally | Medium | Documented (intentional demo) |
| F10 | `creationFeePaid` is purely client-side (server trusts the flag) | Medium | Documented |
| F11 | JSON file store has read-modify-write races and silently swallows write errors | Medium | Documented |
| F12 | Plain-text comment stored alongside its hash | Low | Documented |
| F13 | `makePasscode` uses `Math.random()` (not cryptographically random) | Low | Documented |
| F14 | Hard-coded fallback Reown project ID in source | Low | Documented |
| F15 | Routing uses `Host` header; not security-sensitive but worth noting | Info | Documented |
| F16 | Solana program: review uniqueness depends on PDA `init` failing on re-submission (good, but should be explicit) | Info | Documented |
| F17 | `programs/ezrate/src/lib.rs` ships placeholder program ID | Info | Documented |

Total: 17 findings (2 High, 8 Medium, 4 Low, 3 Info). Items F1, F2, F3, F4,
F5, F6, F7 are fixed on this branch.

---

## 4. Detailed Findings

### F1 — No request-body validation on API routes  ·  **High**  ·  *Fixed*

**Affected:** `web/app/api/events/route.ts`, `web/app/api/reviews/route.ts`

Both API routes parse `request.json()` and immediately coerce fields with
`String(...)` / `Number(...)`. There were no length caps, no JSON-parse
guard, no enum checks, no email format check, and no integer check. A caller
could:

- Send a multi-megabyte `comment` or `whitelistEmails` value, blowing up
  memory and disk on every read-modify-write of `web/data/runtime.json`.
- Send arbitrary objects/arrays that get coerced via `String(...)` to junk
  like `"[object Object]"` and persisted.
- Send malformed JSON, throwing inside the route handler instead of producing
  a clean 400.
- Send `rewardMode`/`rewardAsset`/`creationFeeStatus` strings outside the
  allowed enum and have them stored verbatim (and then echoed by the API).

**Fix on this branch:**

- New helper `web/lib/validate.ts` with `asString`, `asInt`, `asEnum`,
  `asIsoDate`, `isEmail`, and a `LIMITS` table of explicit byte/length caps.
- `POST /api/reviews` now validates: JSON parse, required `eventSlug`,
  RFC-shaped email, integer rating in `[1, 5]`, and `comment` length capped
  at 2000 characters.
- `POST /api/events` now validates: JSON parse, required `name` /
  `location`, integer `maxReviews` in `[1, 10000]`, `endsAt >= startsAt`,
  enum-checked reward mode/asset/fee status, and a 64 KB cap on the raw
  whitelist textarea plus a 1000-email cap after splitting.
- `PUT /api/events` (passcode lookup) now validates the JSON body and
  requires a passcode string of bounded length.

**Not fixed (out of scope):** there is still no auth and no rate limit. See
F8.

---

### F2 — Slug collision lets new events overwrite existing ones  ·  **High**  ·  *Fixed*

**Affected:** `web/lib/store.ts` (`makeSlug`, `createEvent`)

Old behavior:

```ts
function makeSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}
```

`createEvent` set `slug = makeSlug(input.name)` with **no uniqueness check**.
`getEvent(slug)` and `submitReview` both use `find((e) => e.slug === slug)`
which returns the first match. So:

- Two events named "Solana Builder Night" produce the same slug and
  `unshift` makes the new one win — but reviews still match the *first*
  event found. This silently routes ratings to the wrong event.
- A name made entirely of special characters (`"!!!"`) yields an empty slug,
  producing the URL `/event/`.

**Fix on this branch:**

- `makeSlug` falls back to `'event'` if the slug would be empty.
- New `makeUniqueSlug` appends `-2`, `-3`, … against the set of existing
  slugs before finally falling back to `-${Date.now()}`.
- `createEvent` now calls `makeUniqueSlug`.

This is a behavior change visible to the API: two events with the same name
will now have distinct slugs (`my-event`, `my-event-2`).

---

### F3 — `rating` accepts non-integer values off-chain  ·  **Medium**  ·  *Fixed*

**Affected:** `web/app/api/reviews/route.ts`, `web/lib/store.ts`

`Number(body.rating || 0)` followed by `rating < 1 || rating > 5` accepted
`2.5`, `4.999`, `Infinity` (no — but it accepted floats). The on-chain
program enforces `u8` and `1..=5`, so a float would also corrupt the
`averageRating` rolling computation off-chain.

**Fix on this branch:** API now requires `Number.isInteger(rating)` between
1 and 5 via `asInt`.

---

### F4 — Email format never validated server-side  ·  **Medium**  ·  *Fixed*

**Affected:** `web/app/api/reviews/route.ts`

Old code accepted any string (after `trim/toLowerCase`) as an email and
compared it against the whitelist. A user could probe whitelist behavior with
arbitrary strings ("admin", whitespace, unicode lookalikes).

**Fix on this branch:** `isEmail(value)` enforces a basic
`^[^\s@]+@[^\s@]+\.[^\s@]+$` shape and a 254-character cap (RFC 5321 limit)
before the request reaches the store.

---

### F5 — Empty event name produces empty slug → broken routing  ·  **Medium**  ·  *Fixed*

**Affected:** `web/lib/store.ts`

Covered by F2's fallback (`'event'`).

---

### F6 — Build fails: `<a href="/">` for internal route  ·  **Medium (CI)**  ·  *Fixed*

**Affected:** `web/components/LandingPage.tsx`

`next/core-web-vitals` treats `<a href="/">` for internal navigation as a
hard ESLint **error**, which fails `next build` on Vercel. Fixed by
importing `next/link` and using `<Link className="brand" href="/">`.

`<img>` warnings remain in `LandingPage.tsx`, `ReviewForm.tsx`, and
`AppHome.tsx`. Those are warnings only and do not break the build; switching
to `next/image` is left as a follow-up because it requires deciding whether
SVGs/Reown logos should be optimized.

---

### F7 — No ESLint config committed → CI is interactive  ·  **Medium (CI)**  ·  *Fixed*

**Affected:** repo root

`web/` had no `.eslintrc*` / `eslint.config.*` despite `next lint` being a
package script. On a fresh clone, `next lint` and `next build` (which runs
lint internally) prompt the user to pick a preset. In CI this either hangs
or — depending on TTY — fails immediately.

**Fix on this branch:** added `web/.eslintrc.json` with the Next.js Strict
preset (`next/core-web-vitals`, `next/typescript`).

---

### F8 — Event creation has no authentication or rate limiting  ·  **High**  ·  *Documented*

**Affected:** `POST /api/events`

Anyone reachable by the deployment can create events; there is no signed
wallet attestation, no API key, and no rate limit. Coupled with F1, this is
the path most likely to be abused (storage exhaustion, demo pollution).

**Recommended fix (post-MVP):**

1. Require a connected wallet. The frontend already integrates Reown
   AppKit; pass the wallet `address` and a signed nonce, verify on the
   server with `tweetnacl` / `@solana/web3.js` `nacl.sign.detached.verify`.
2. Move event creation to Supabase (already planned in `SUPABASE.md`) and
   apply Postgres row-level security so an organizer only sees / mutates
   their own events.
3. Add a basic IP-based rate limit (e.g. Upstash Ratelimit or a simple
   in-memory bucket while still on the MVP host).

Not fixed on this branch because it would require an auth design that the
README explicitly defers to "production".

---

### F9 — Hard-coded backdoor passcode  ·  **Medium**  ·  *Documented*

**Affected:** `web/lib/store.ts` (`getEventByPasscode`)

```ts
if (normalizedPasscode === 'solananight52') {
  const event = db.events.find((item) => item.slug === 'solana-builder-night') || demoEvent()
  return { ...event, whitelistEmails: [] }
}
```

This unconditionally returns the demo event, even if it was deleted from
the database, and even on production deployments. For the MVP / pitch
demo it is intentional; before production it must be removed or gated
behind `process.env.NODE_ENV !== 'production'`.

---

### F10 — `creationFeePaid` is purely client-side  ·  **Medium**  ·  *Documented*

**Affected:** `web/components/AppHome.tsx`, `web/app/api/events/route.ts`

`AppHome.tsx` shows a "Pay fee" button that just sets a local React state
to `true`. The `creationFeeStatus` string is then sent to the backend,
which trusts it. Anyone calling the API directly can pass
`"creationFeeStatus": "paid"` for free. Important if the product depends on
the fee.

**Recommended fix:** verify the fee transaction signature on the server
before persisting an event, or rely on the relayer/Solana program to gate
event creation on payment. Not fixed because it requires real on-chain
plumbing.

---

### F11 — JSON file store has races and silent write failures  ·  **Medium**  ·  *Documented*

**Affected:** `web/lib/store.ts` (`loadDb`, `saveDb`, `submitReview`,
`createEvent`)

- `submitReview` is read-modify-write with no locking. Two concurrent
  reviews can both pass the duplicate check, both increment counts off the
  same base, and the second overwrite of `runtime.json` wins, losing one
  review.
- `saveDb` swallows write errors (`catch {}`). On Vercel's read-only file
  system every write fails silently. The user gets a 201 even though no
  data was persisted.

**Recommended fix:** Migrate to Supabase per `SUPABASE.md`. At minimum, log
the write error to `console.error` so it shows up in Vercel logs.
Not fixed: this is the central premise of the MVP storage design and
documented as such in the README.

---

### F12 — Plain-text comment stored alongside its hash  ·  **Low**  ·  *Documented*

**Affected:** `web/lib/store.ts` (`submitReview`)

The README claims comments are hashed; the code stores both the cleartext
comment and `sha256(comment)`. The cleartext is not currently exposed by
the API (only `id`, `rating`, `status`, `reviewerHash`, `commentHash` are
returned) so the privacy impact is low, but if a future endpoint surfaces
reviews this becomes user-visible.

**Recommendation:** when migrating to Supabase, store comments encrypted at
rest or only in a moderator-readable schema.

---

### F13 — `makePasscode` uses `Math.random()`  ·  **Low**  ·  *Documented*

**Affected:** `web/lib/store.ts` (`makePasscode`)

Passcodes use a 2-digit `Math.floor(10 + Math.random() * 90)` suffix on a
truncated event name. They are predictable and have very low entropy
(at most 90 values per name). For the demo this is fine; for production
use `crypto.randomInt(...)` and at least 6 random digits or 8 base32
characters.

---

### F14 — Hard-coded Reown project ID  ·  **Low**  ·  *Documented*

**Affected:** `web/context/index.tsx`, `web/.env.example`

Both ship a public Reown project ID
(`b56e18d47c72ab683b10814fe9495694`) as a fallback. This is a "localhost
demo" project per `DEPLOY_VERCEL.md`. It is not technically a secret, but
keeping the fallback in source means a forgotten Vercel env var will
quietly route real traffic through the demo project. Recommended:
`throw` if `NEXT_PUBLIC_REOWN_PROJECT_ID` is unset and `NODE_ENV ===
'production'`.

---

### F15 — Routing on the `Host` header  ·  **Info**  ·  *Documented*

**Affected:** `web/app/page.tsx`

`headers().get('host').startsWith('app.')` is a soft router. It is not a
security boundary; just be aware that anyone can fake the `Host` header
when hitting Next.js directly (i.e. without going through Vercel's
edge), so do not rely on it for any access decisions.

---

### F16 — Solana program: review uniqueness via PDA seeds  ·  **Info**  ·  *Documented*

**Affected:** `programs/ezrate/src/instructions/submit_review.rs`

`#[account(init, payer = relayer, seeds = [b"review", event, reviewer_hash.as_ref()], bump)]`
prevents the same `(event, reviewer_hash)` pair from creating two `Review`
accounts (the second `init` reverts because the PDA already exists). This
is the correct pattern; documented here so reviewers know not to add a
redundant uniqueness check.

The `EventFull` and `InvalidRating` checks in the same file are correct.
`max_reviews > 0` and `name.len() > 0` in `create_event` are also good.

---

### F17 — Placeholder program ID  ·  **Info**  ·  *Documented*

**Affected:** `programs/ezrate/src/lib.rs`

`declare_id!("EZRate1111111111111111111111111111111111111")` is a vanity
placeholder. Before a real devnet demo, generate a keypair, deploy, and
update both the program and any client code that references the ID.

---

## 5. Improvement Added: `/api/health`

A small, dependency-free liveness endpoint was added at `web/app/api/health/route.ts`:

```http
GET /api/health
200 OK
Content-Type: application/json
Cache-Control: no-store

{
  "status": "ok",
  "service": "ezrate-web",
  "time": "2026-05-06T01:03:47.571Z",
  "uptimeSeconds": 4,
  "env": "production"
}
```

**Why this feature:**

- It fits naturally with a Vercel-deployed Next.js MVP — uptime checkers
  (UptimeRobot, BetterStack, Pingdom, Vercel's own monitor, k8s probes if
  the deployment moves) need a cheap, predictable endpoint.
- It does not touch the data store, so it is safe to hit at high
  frequency and gives a true "process is up" signal independent of
  Supabase / JSON / Solana availability.
- Returning `uptimeSeconds` and `env` makes it easy to confirm a deploy
  rolled by watching `uptimeSeconds` reset.
- Zero new dependencies, zero behavior change for existing flows.

---

## 6. Files Changed on this Branch

| File | Status | Reason |
| --- | --- | --- |
| `AUDIT_REPORT.md` | added | this report |
| `web/.eslintrc.json` | added | F7 — make `next lint` / `next build` non-interactive |
| `web/lib/validate.ts` | added | F1/F3/F4 — shared input-validation helpers |
| `web/app/api/health/route.ts` | added | new feature |
| `web/app/api/events/route.ts` | modified | F1 — full body validation |
| `web/app/api/reviews/route.ts` | modified | F1/F3/F4 — full body validation |
| `web/lib/store.ts` | modified | F2/F5 — unique-slug generation, empty-slug fallback |
| `web/components/LandingPage.tsx` | modified | F6 — replace `<a href="/">` with `<Link>` |

No core business logic, no data, no Solana program, and no UX flow was
changed.

---

## 7. Testing

- `npm run lint` — passes with warnings only (was failing with a
  hard error on `LandingPage.tsx:8` before this branch).
- `npm run build` — passes; `/api/health`, `/api/events`, and
  `/api/reviews` show up in the route manifest:

  ```text
  ƒ /api/events            136 B   104 kB
  ƒ /api/health            136 B   104 kB
  ƒ /api/reviews           136 B   104 kB
  ```

- `npx next start` smoke tests against a built bundle:

  | Request | Result |
  | --- | --- |
  | `GET /api/health` | `200 {"status":"ok",...}` |
  | `POST /api/reviews` with body `not-json` | `400 {"message":"Invalid JSON body."}` |
  | `POST /api/reviews` with `email:"bad"` | `400 {"message":"A valid email is required."}` |
  | `POST /api/reviews` with `rating:2.5` | `400 {"message":"Rating must be an integer from 1 to 5."}` |
  | `POST /api/reviews` with `comment:""` | `400 {"message":"Review must be a non-empty string under 2000 characters."}` |
  | `POST /api/events` with `maxReviews:-1` | `400 {"message":"maxReviews must be an integer between 1 and 10000."}` |
  | `PUT /api/events` with `{}` | `400 {"message":"Passcode is required."}` |

- Solana tests (`quasar test`) were not run: this VM cannot reach
  `git@github.com:blueshift-gg/quasar` (the `quasar-lang` dependency host)
  and the toolchain is not preinstalled. No Rust code was changed on this
  branch.

---

## 8. Notes for Reviewer

- This PR is **non-breaking for users**: existing requests that already
  conform to the documented schema still succeed unchanged. Only previously
  silently-broken or oversized inputs now return a clean 400.
- The biggest behavior change is **slug uniqueness** (F2): new events
  whose name collides with an existing slug now get `-2`, `-3`, ... appended.
  If any frontend code or saved share-link assumes "the slug equals the
  slugified name" it will need to read the slug back from the API response
  (which the existing `AppHome.tsx` already does via `payload.event`).
- F8 (auth on event creation) and F11 (race-free storage) are deferred to
  the planned Supabase migration. They are documented here so they are
  not lost.
- Three `<img>` lint warnings remain. They are pre-existing, are warnings
  (not errors), and are deliberately not changed because switching to
  `next/image` for SVG brand assets is a UX/design call.
