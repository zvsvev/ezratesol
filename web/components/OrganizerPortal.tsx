'use client'

import { useAppKit, useAppKitAccount } from '@reown/appkit/react'
import Link from 'next/link'
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarPlus,
  Check,
  Copy,
  Edit3,
  ExternalLink,
  Loader2,
  Mail,
  Plus,
  RadioTower,
  Save,
  Sparkles,
  TicketCheck,
  WalletCards,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { EventRecord, RewardAsset, RewardMode } from '@/lib/types'

type OrganizerProfile = {
  wallet: string
  companyName: string
  username: string
  description: string
  website: string
  x: string
  instagram: string
  venue: string
  credits: number
  createdAt: string
  updatedAt: string
}

const CREDIT_PLANS = [
  {
    id: 'free',
    name: 'Free',
    credits: 0,
    subtitle: 'Buy credits later when creating an event.',
    cta: 'Start free',
  },
  {
    id: 'small',
    name: 'Small events',
    credits: 2000,
    subtitle: '2,000 credits for meetups, workshops, and demo nights.',
    cta: 'Buy 2,000 credits',
  },
  {
    id: 'large',
    name: 'Larger events',
    credits: 10000,
    subtitle: '10,000 credits for conferences and multi-day activations.',
    cta: 'Buy 10,000 credits',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    credits: null,
    subtitle: 'Custom volume, USDC invoicing, managed reward campaigns, and support.',
    cta: 'Contact admin',
  },
] as const

function normalizeUsername(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 24)
}

function profileKey(address: string) {
  return `ezrate-eo-profile:${address.toLowerCase()}`
}

function loadPublicProfiles(): Record<string, OrganizerProfile> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(window.localStorage.getItem('ezrate-eo-profiles') || '{}') as Record<string, OrganizerProfile>
  } catch {
    return {}
  }
}

function savePublicProfile(profile: OrganizerProfile) {
  const profiles = loadPublicProfiles()
  profiles[profile.username] = profile
  window.localStorage.setItem('ezrate-eo-profiles', JSON.stringify(profiles))
}

export function OrganizerPortal() {
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()
  const [profile, setProfile] = useState<OrganizerProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showCredits, setShowCredits] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [createdEvent, setCreatedEvent] = useState<EventRecord | null>(null)
  const [form, setForm] = useState({
    companyName: '',
    username: '',
    description: '',
    website: '',
    x: '',
    instagram: '',
    venue: '',
  })
  const [eventForm, setEventForm] = useState({
    name: '',
    location: '',
    maxReviews: 200,
    endsAt: '',
    rewardMode: 'random' as RewardMode,
    rewardAsset: 'USDC' as RewardAsset,
    rewardAmount: '',
    whitelistEmails: '',
  })

  useEffect(() => {
    if (!address) {
      setProfile(null)
      return
    }
    const saved = window.localStorage.getItem(profileKey(address))
    if (!saved) {
      setProfile(null)
      setForm({
        companyName: '',
        username: '',
        description: '',
        website: '',
        x: '',
        instagram: '',
        venue: '',
      })
      return
    }
    const parsed = JSON.parse(saved) as OrganizerProfile
    setProfile(parsed)
    setForm({
      companyName: parsed.companyName,
      username: parsed.username,
      description: parsed.description,
      website: parsed.website,
      x: parsed.x,
      instagram: parsed.instagram,
      venue: parsed.venue,
    })
  }, [address])

  const profileUrl = profile ? `https://app.ezrate.fun/${profile.username}` : ''
  const creditNeed = Math.max(1, Number(eventForm.maxReviews) || 1)
  const canCreateEvent = !!profile && profile.credits >= creditNeed

  function persistProfile(nextProfile: OrganizerProfile) {
    window.localStorage.setItem(profileKey(nextProfile.wallet), JSON.stringify(nextProfile))
    savePublicProfile(nextProfile)
    setProfile(nextProfile)
  }

  function registerProfile() {
    if (!address) return
    const companyName = form.companyName.trim()
    const username = normalizeUsername(form.username)
    if (!companyName || username.length < 3) {
      setNotice('Company name and a 3+ character username are required.')
      return
    }

    const publicProfiles = loadPublicProfiles()
    if (publicProfiles[username] && publicProfiles[username].wallet.toLowerCase() !== address.toLowerCase()) {
      setNotice('That username is already claimed in this browser demo.')
      return
    }

    const now = new Date().toISOString()
    const nextProfile: OrganizerProfile = {
      wallet: address,
      companyName,
      username,
      description: form.description.trim(),
      website: form.website.trim(),
      x: form.x.trim(),
      instagram: form.instagram.trim(),
      venue: form.venue.trim(),
      credits: 0,
      createdAt: now,
      updatedAt: now,
    }

    persistProfile(nextProfile)
    setNotice('Organizer profile registered. Choose a credit plan to continue.')
    setShowCredits(true)
  }

  function updateEditableProfile() {
    if (!profile) return
    const nextProfile = {
      ...profile,
      description: form.description.trim(),
      website: form.website.trim(),
      x: form.x.trim(),
      instagram: form.instagram.trim(),
      venue: form.venue.trim(),
      updatedAt: new Date().toISOString(),
    }
    persistProfile(nextProfile)
    setIsEditing(false)
    setNotice('Organizer details updated.')
  }

  function addCredits(credits: number) {
    if (!profile) return
    const nextProfile = {
      ...profile,
      credits: profile.credits + credits,
      updatedAt: new Date().toISOString(),
    }
    persistProfile(nextProfile)
    setShowCredits(false)
    setNotice(credits > 0 ? `${credits.toLocaleString()} credits added.` : 'Free plan selected. You can buy credits when creating an event.')
  }

  async function createEvent() {
    if (!profile) return
    if (!canCreateEvent) {
      setShowCredits(true)
      setNotice(`You need ${creditNeed.toLocaleString()} credits. 1 credit = 1 user rating transaction.`)
      return
    }
    setIsCreating(true)
    setNotice(null)
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: eventForm.name,
          location: eventForm.location || profile.venue,
          startsAt: new Date().toISOString(),
          endsAt: eventForm.endsAt,
          organizer: profile.companyName,
          maxReviews: eventForm.maxReviews,
          rewardMode: eventForm.rewardMode,
          rewardAsset: eventForm.rewardAsset,
          rewardAmount: eventForm.rewardAmount,
          creationFeeStatus: 'paid',
          whitelistEmails: eventForm.whitelistEmails,
        }),
      })
      const payload = await response.json()
      if (!response.ok) {
        setNotice(payload.message || 'Unable to create event.')
        return
      }
      const event = payload.event as EventRecord
      setCreatedEvent(event)
      persistProfile({
        ...profile,
        credits: profile.credits - creditNeed,
        updatedAt: new Date().toISOString(),
      })
      setEventForm({
        name: '',
        location: '',
        maxReviews: 200,
        endsAt: '',
        rewardMode: 'random',
        rewardAsset: 'USDC',
        rewardAmount: '',
        whitelistEmails: '',
      })
      setNotice(`${creditNeed.toLocaleString()} credits reserved for reviewer gasless transactions.`)
    } finally {
      setIsCreating(false)
    }
  }

  async function copyProfileUrl() {
    if (!profileUrl) return
    await navigator.clipboard.writeText(profileUrl)
    setNotice('Organizer profile link copied.')
  }

  const walletLabel = useMemo(() => {
    if (!address) return 'Not connected'
    return `${address.slice(0, 5)}...${address.slice(-5)}`
  }, [address])

  return (
    <main className="eoPage">
      <header className="eoNav">
        <Link className="brand" href="/">
          <img src="/ezrate-logo.png" alt="" />
          EZRATE
        </Link>
        <div className="eoNavActions">
          <a href="https://app.ezrate.fun">Reviewer app</a>
          <button className="button secondary" onClick={() => open()} type="button">
            {isConnected ? walletLabel : 'SIGN IN OR REGISTER'} <WalletCards size={18} />
          </button>
        </div>
      </header>

      {!isConnected ? (
        <section className="eoAuth">
          <img src="/ezrate-logo.png" alt="" />
          <p className="eyebrow">
            <Sparkles size={16} /> Event Organizer Portal
          </p>
          <h1>Run gasless review campaigns from one desktop console.</h1>
          <p>Connect a wallet to register your organizer identity, claim your public username, buy credits, and create events.</p>
          <button className="button" onClick={() => open()} type="button">
            SIGN IN OR REGISTER <ArrowRight size={18} />
          </button>
        </section>
      ) : !profile ? (
        <section className="eoOnboarding">
          <div className="eoIntro">
            <p className="eyebrow">
              <Building2 size={16} /> Mandatory organizer registration
            </p>
            <h1>Claim your organizer identity before creating events.</h1>
            <p>
              Company name and username are locked after registration. Description, socials, and venue can be edited later from the portal.
            </p>
          </div>
          <div className="eoFormCard">
            <label className="field">
              Company name
              <input value={form.companyName} onChange={(event) => setForm({ ...form, companyName: event.target.value })} placeholder="Company" />
            </label>
            <label className="field">
              Public username
              <input
                value={form.username}
                onChange={(event) => setForm({ ...form, username: normalizeUsername(event.target.value) })}
                placeholder="username"
              />
            </label>
            <label className="field">
              Organizer description
              <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Short intro" />
            </label>
            <div className="eoTwoCol">
              <label className="field">
                Website
                <input value={form.website} onChange={(event) => setForm({ ...form, website: event.target.value })} placeholder="https://..." />
              </label>
              <label className="field">
                Main venue
                <input value={form.venue} onChange={(event) => setForm({ ...form, venue: event.target.value })} placeholder="Venue" />
              </label>
            </div>
            <div className="eoTwoCol">
              <label className="field">
                X / Twitter
                <input value={form.x} onChange={(event) => setForm({ ...form, x: event.target.value })} placeholder="@handle" />
              </label>
              <label className="field">
                Instagram
                <input value={form.instagram} onChange={(event) => setForm({ ...form, instagram: event.target.value })} placeholder="@handle" />
              </label>
            </div>
            {notice && <div className="notice">{notice}</div>}
            <button className="button" onClick={registerProfile} type="button">
              Register organizer <ArrowRight size={18} />
            </button>
          </div>
        </section>
      ) : (
        <section className="eoWorkspace">
          <div className="eoHero">
            <div>
              <p className="eyebrow">
                <BadgeCheck size={16} /> Registered organizer
              </p>
              <h1>{profile.companyName}</h1>
              <p>{profile.description || 'Add an organizer description so attendees know who is running the event.'}</p>
              <div className="eoProfileActions">
                <button className="button secondary" onClick={copyProfileUrl} type="button">
                  Copy app.ezrate.fun/{profile.username} <Copy size={18} />
                </button>
                <a className="button ghost" href={profileUrl}>
                  View public page <ExternalLink size={18} />
                </a>
              </div>
            </div>
            <div className="creditBalance">
              <span>Available credits</span>
              <strong>{profile.credits.toLocaleString()}</strong>
              <p>1 credit = 1 user rating transaction. Reviewers do not pay fees.</p>
              <button className="button" onClick={() => setShowCredits(true)} type="button">
                Buy credits <Plus size={18} />
              </button>
            </div>
          </div>

          <div className="eoStats">
            <div><span>Username</span><strong>@{profile.username}</strong></div>
            <div><span>Default venue</span><strong>{profile.venue || 'Not set'}</strong></div>
            <div><span>Wallet identity</span><strong>{walletLabel}</strong></div>
            <div><span>Pricing rule</span><strong>1 credit / rating tx</strong></div>
          </div>

          <div className="eoGrid">
            <section className="eoPanel">
              <div className="panelTitle">
                <CalendarPlus size={20} />
                <div>
                  <h2>Create event</h2>
                  <p>Credits replace user-paid gas. Set max reviewers based on how many rating transactions you want to sponsor.</p>
                </div>
              </div>
              <label className="field">
                Event name
                <input value={eventForm.name} onChange={(event) => setEventForm({ ...eventForm, name: event.target.value })} placeholder="Event" />
              </label>
              <div className="eoTwoCol">
                <label className="field">
                  Venue / city
                  <input value={eventForm.location} onChange={(event) => setEventForm({ ...eventForm, location: event.target.value })} placeholder={profile.venue || 'Venue'} />
                </label>
                <label className="field">
                  Event end
                  <input value={eventForm.endsAt} onChange={(event) => setEventForm({ ...eventForm, endsAt: event.target.value })} type="datetime-local" />
                </label>
              </div>
              <div className="eoTwoCol">
                <label className="field">
                  Max reviewers
                  <input min={1} type="number" value={eventForm.maxReviews} onChange={(event) => setEventForm({ ...eventForm, maxReviews: Number(event.target.value) })} />
                </label>
                <label className="field">
                  Reward amount
                  <input value={eventForm.rewardAmount} onChange={(event) => setEventForm({ ...eventForm, rewardAmount: event.target.value })} placeholder="Amount" />
                </label>
              </div>
              <div className="eoTwoCol">
                <label className="field">
                  Reward mode
                  <select value={eventForm.rewardMode} onChange={(event) => setEventForm({ ...eventForm, rewardMode: event.target.value as RewardMode })}>
                    <option value="none">None</option>
                    <option value="random">Random</option>
                    <option value="pro-rata">Pro-rata</option>
                  </select>
                </label>
                <label className="field">
                  Reward asset
                  <select value={eventForm.rewardAsset} onChange={(event) => setEventForm({ ...eventForm, rewardAsset: event.target.value as RewardAsset })}>
                    <option value="SOL">SOL</option>
                    <option value="USDC">USDC</option>
                    <option value="voucher">Voucher</option>
                  </select>
                </label>
              </div>
              <label className="field">
                Luma whitelist emails
                <textarea value={eventForm.whitelistEmails} onChange={(event) => setEventForm({ ...eventForm, whitelistEmails: event.target.value })} placeholder="Paste emails" />
              </label>
              <div className={`creditQuote ${canCreateEvent ? 'ready' : ''}`}>
                <TicketCheck size={20} />
                <div>
                  <strong>{creditNeed.toLocaleString()} credits required</strong>
                  <span>{canCreateEvent ? 'Enough credits available.' : 'Buy credits before creating this event.'}</span>
                </div>
              </div>
              <button className="button" disabled={isCreating} onClick={createEvent} type="button">
                {isCreating ? 'Creating' : canCreateEvent ? 'Create event' : 'Buy credits first'} {isCreating ? <Loader2 size={18} /> : <ArrowRight size={18} />}
              </button>
            </section>

            <section className="eoPanel">
              <div className="panelTitle">
                <Building2 size={20} />
                <div>
                  <h2>Organizer details</h2>
                  <p>Company name and username are fixed. Other profile fields can be edited.</p>
                </div>
              </div>
              <div className="lockedFields">
                <div><span>Company</span><strong>{profile.companyName}</strong></div>
                <div><span>Username</span><strong>@{profile.username}</strong></div>
              </div>
              <label className="field">
                Description
                <textarea disabled={!isEditing} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Short intro" />
              </label>
              <label className="field">
                Venue
                <input disabled={!isEditing} value={form.venue} onChange={(event) => setForm({ ...form, venue: event.target.value })} placeholder="Venue" />
              </label>
              <div className="eoTwoCol">
                <label className="field">
                  Website
                  <input disabled={!isEditing} value={form.website} onChange={(event) => setForm({ ...form, website: event.target.value })} placeholder="https://..." />
                </label>
                <label className="field">
                  X / Twitter
                  <input disabled={!isEditing} value={form.x} onChange={(event) => setForm({ ...form, x: event.target.value })} placeholder="@handle" />
                </label>
              </div>
              <label className="field">
                Instagram
                <input disabled={!isEditing} value={form.instagram} onChange={(event) => setForm({ ...form, instagram: event.target.value })} placeholder="@handle" />
              </label>
              {isEditing ? (
                <button className="button" onClick={updateEditableProfile} type="button">
                  Save editable fields <Save size={18} />
                </button>
              ) : (
                <button className="button quiet" onClick={() => setIsEditing(true)} type="button">
                  Edit organizer details <Edit3 size={18} />
                </button>
              )}
            </section>
          </div>

          {createdEvent && (
            <section className="eoCreated">
              <Check size={22} />
              <div>
                <strong>{createdEvent.name} is ready</strong>
                <span>Passcode: {createdEvent.passcode} · Review link: app.ezrate.fun/event/{createdEvent.slug}</span>
              </div>
            </section>
          )}
          {notice && <div className="notice eoNotice">{notice}</div>}
        </section>
      )}

      {showCredits && profile && (
        <div className="pricingOverlay" role="dialog" aria-modal="true" aria-label="Buy EZRATE credits">
          <section className="pricingModal">
            <div className="pricingHeader">
              <div>
                <p className="eyebrow">
                  <RadioTower size={16} /> EZRATE Credits
                </p>
                <h2>Buy credits for gasless reviewer transactions.</h2>
                <p>1 credit = 1 user rating transaction. Reviewers never need to pay SOL.</p>
              </div>
              <button className="iconButton" onClick={() => setShowCredits(false)} type="button" aria-label="Close pricing">
                ×
              </button>
            </div>
            <div className="pricingGrid">
              {CREDIT_PLANS.map((plan) => (
                <article className={`priceCard ${plan.id === 'large' ? 'featured' : ''}`} key={plan.id}>
                  <span>{plan.name}</span>
                  <strong>{plan.credits === null ? 'Custom' : plan.credits.toLocaleString()}</strong>
                  <p>{plan.subtitle}</p>
                  {plan.credits === null ? (
                    <a className="button ghost" href="mailto:admin@ezrate.fun">
                      {plan.cta} <Mail size={18} />
                    </a>
                  ) : (
                    <button className="button secondary" onClick={() => addCredits(plan.credits)} type="button">
                      {plan.cta} <ArrowRight size={18} />
                    </button>
                  )}
                </article>
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
