# Deploy EZRATE to Vercel

This guide deploys the Next.js MVP in `web/` to Vercel.

## 1. Push to GitHub

```bash
cd /Users/ulinnuha.eth/ezratesol
git remote add origin https://github.com/zvsvev/ezratesol.git
git push -u origin main
```

If the remote already exists:

```bash
git remote set-url origin https://github.com/zvsvev/ezratesol.git
git push -u origin main
```

## 2. Create a Reown Project ID

1. Open `https://dashboard.reown.com`.
2. Create a new project.
3. Enable the Solana adapter and Google/social login if available for your plan.
4. Add your production domains:
   - `https://ezrate.fun`
   - `https://app.ezrate.fun`
   - your Vercel preview domain
5. Copy the project ID.

For local testing, the repo uses Reown's localhost demo project ID in `web/.env.example`.

## 3. Import the GitHub Repo in Vercel

1. Open `https://vercel.com/new`.
2. Import `zvsvev/ezratesol`.
3. In project settings, set:
   - Framework Preset: `Next.js`
   - Root Directory: `web`
   - Build Command: `npm run build`
   - Install Command: `npm install`
   - Output Directory: leave default

Vercel should detect the app automatically after you set the root directory to `web`.

## 4. Add Environment Variables

In Vercel project settings, add:

```text
NEXT_PUBLIC_REOWN_PROJECT_ID=your-reown-project-id
NEXT_PUBLIC_SOLANA_CLUSTER=devnet
NEXT_PUBLIC_APP_URL=https://ezrate.fun
EZRATE_RELAYER_PUBLIC_KEY=replace-with-devnet-relayer
```

For preview deployments, `NEXT_PUBLIC_APP_URL` can temporarily be your Vercel preview URL.

## 5. Deploy

Click `Deploy` in Vercel.

After the first deploy finishes, open the generated Vercel URL and test:

- Landing page: `/`
- Mobile app: `/app`
- Demo passcode flow: click `Review`, enter `solananight52`
- Direct demo review URL: `/event/solana-builder-night`

## 6. Add Custom Domains

In Vercel:

1. Open Project Settings.
2. Go to `Domains`.
3. Add:
   - `ezrate.fun`
   - `app.ezrate.fun`
4. Follow Vercel's DNS instructions at your domain registrar.

Recommended routing:

- `ezrate.fun` uses `/` and shows the landing page.
- `app.ezrate.fun` also serves the same Next.js app, but the code detects the `app.` host and opens the mobile app view.

## 7. MVP Production Notes

Before using real events:

- Replace JSON file storage in `web/data` with a hosted database such as Supabase, Neon, Turso, or Upstash.
- Keep emails off-chain. Store email hashes or verify with your backend.
- Add a real relayer service for sponsored Solana review transactions.
- Deploy the Quasar program to Solana devnet and replace the placeholder program ID.
- Add reward payout logic after the 24-hour review window closes.

## Common Issues

### Reown Modal Does Not Load

Check that `NEXT_PUBLIC_REOWN_PROJECT_ID` is set in Vercel and that your domain is allowed in Reown Cloud.

### App Shows Landing Page on app.ezrate.fun

Make sure the domain is exactly `app.ezrate.fun`. The app checks whether the host starts with `app.`.

### Review Passcode Does Not Work

Use the demo passcode:

```text
solananight52
```

Created events generate their own passcode after the organizer submits the create form.
