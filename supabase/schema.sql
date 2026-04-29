-- EZRATE MVP Supabase schema.
-- Run this in the Supabase SQL editor when moving from JSON/localStorage to hosted storage.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  wallet_address text unique not null,
  display_name text not null default 'EZRATE User',
  email text,
  role text not null default 'reviewer' check (role in ('organizer', 'reviewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  location text not null,
  organizer_wallet text not null,
  max_reviews integer not null check (max_reviews > 0),
  passcode text unique not null,
  banner_image text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  review_opens_at timestamptz not null,
  review_closes_at timestamptz not null,
  reward_mode text not null default 'none' check (reward_mode in ('none', 'random', 'pro-rata')),
  reward_asset text not null default 'SOL' check (reward_asset in ('SOL', 'USDC', 'voucher')),
  reward_amount text,
  creation_fee_status text not null default 'unpaid' check (creation_fee_status in ('unpaid', 'paid')),
  onchain_event text,
  average_rating numeric not null default 0,
  review_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.event_whitelist (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  email_hash text not null,
  created_at timestamptz not null default now(),
  unique (event_id, email_hash)
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  reviewer_wallet text not null,
  reviewer_hash text not null,
  rating integer not null check (rating between 1 and 5),
  comment_hash text not null,
  comment text not null,
  status text not null default 'pending-relay' check (status in ('pending-relay', 'confirmed')),
  created_at timestamptz not null default now(),
  unique (event_id, reviewer_hash)
);

create table if not exists public.rewards (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  review_id uuid references public.reviews(id) on delete set null,
  wallet_address text not null,
  reward_asset text not null,
  reward_amount text not null,
  status text not null default 'pending' check (status in ('pending', 'won', 'claimable', 'paid')),
  created_at timestamptz not null default now()
);
