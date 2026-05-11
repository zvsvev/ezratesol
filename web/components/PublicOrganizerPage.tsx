'use client'

import { ArrowRight, Building2, Globe, Instagram, Link2, MapPin, MessageSquareText, Star } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

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
}

const demoProfile: OrganizerProfile = {
  wallet: 'demo',
  companyName: 'EZRATE Labs',
  username: 'ezrate',
  description: 'Demo organizer profile for Web3 meetups, builder nights, and on-chain feedback campaigns.',
  website: 'https://ezrate.fun',
  x: '@ezratefun',
  instagram: '@ezrate.fun',
  venue: 'Jakarta',
  credits: 10000,
}

function loadProfile(username: string) {
  if (typeof window === 'undefined') return null
  try {
    const profiles = JSON.parse(window.localStorage.getItem('ezrate-eo-profiles') || '{}') as Record<string, OrganizerProfile>
    return profiles[username] || (username === 'ezrate' ? demoProfile : null)
  } catch {
    return username === 'ezrate' ? demoProfile : null
  }
}

export function PublicOrganizerPage({ username }: { username: string }) {
  const [profile, setProfile] = useState<OrganizerProfile | null>(null)

  useEffect(() => {
    setProfile(loadProfile(username.toLowerCase()))
  }, [username])

  if (!profile) {
    return (
      <main className="publicOrgPage">
        <header className="publicOrgNav">
          <Link className="brand" href="/">
            <img src="/ezrate-logo.png" alt="" />
            EZRATE
          </Link>
          <a className="button secondary" href="https://create.ezrate.fun">
            Register organizer <ArrowRight size={18} />
          </a>
        </header>
        <section className="publicOrgMissing">
          <Building2 size={36} />
          <h1>Organizer not found</h1>
          <p>No organizer has claimed app.ezrate.fun/{username} in this demo browser yet.</p>
          <a className="button" href="https://create.ezrate.fun">
            Claim a username <ArrowRight size={18} />
          </a>
        </section>
      </main>
    )
  }

  return (
    <main className="publicOrgPage">
      <header className="publicOrgNav">
        <Link className="brand" href="/">
          <img src="/ezrate-logo.png" alt="" />
          EZRATE
        </Link>
        <Link className="button secondary" href="/app">
          Launch App <ArrowRight size={18} />
        </Link>
      </header>
      <section className="publicOrgHero">
        <div>
          <p className="eyebrow">
            <Building2 size={16} /> @{profile.username}
          </p>
          <h1>{profile.companyName}</h1>
          <p>{profile.description || 'This organizer has not added a description yet.'}</p>
          <div className="publicSocials">
            {profile.website && <a href={profile.website}><Globe size={17} /> Website</a>}
            {profile.x && <a href={`https://x.com/${profile.x.replace('@', '')}`}><Link2 size={17} /> {profile.x}</a>}
            {profile.instagram && <a href={`https://instagram.com/${profile.instagram.replace('@', '')}`}><Instagram size={17} /> {profile.instagram}</a>}
            {profile.venue && <span><MapPin size={17} /> {profile.venue}</span>}
          </div>
        </div>
        <div className="publicOrgScore">
          <span>Organizer rating</span>
          <strong>4.8</strong>
          <div><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /></div>
          <p>Aggregated from verified event reviews.</p>
        </div>
      </section>
      <section className="publicOrgSections">
        <article>
          <img src="/icons/ezrate-icon-00.png" alt="" />
          <h2>Verified reviews</h2>
          <p>Attendees use passcodes and eligible identity checks before leaving event feedback.</p>
        </article>
        <article>
          <img src="/icons/ezrate-icon-02.png" alt="" />
          <h2>Gasless feedback</h2>
          <p>The organizer funds credits so reviewers do not need SOL to submit ratings.</p>
        </article>
        <article>
          <img src="/icons/ezrate-icon-05.png" alt="" />
          <h2>On-chain proof</h2>
          <p>Ratings and review hashes are designed to be committed to Solana for tamper-resistant history.</p>
        </article>
      </section>
      <section className="publicOrgCta">
        <div>
          <h2>Have an event passcode?</h2>
          <p>Open EZRATE and submit a verified review after the event ends.</p>
        </div>
        <Link className="button secondary" href="/app">
          Start review <MessageSquareText size={18} />
        </Link>
      </section>
    </main>
  )
}
