'use client'

import {
  ArrowRight,
  CalendarPlus,
  Check,
  Home,
  ListChecks,
  Plus,
  Search,
  Star,
  TicketCheck,
  User
} from 'lucide-react'
import { useEffect, useState } from 'react'
import type { EventRecord } from '@/lib/types'

export function AppHome() {
  const [events, setEvents] = useState<EventRecord[]>([])
  const [view, setView] = useState<'home' | 'create'>('home')
  const [name, setName] = useState('ETHGlobal Side Event')
  const [location, setLocation] = useState('Jakarta')
  const [maxReviews, setMaxReviews] = useState(75)
  const [whitelistEmails, setWhitelistEmails] = useState('demo@ezrate.fun\nbuilder@example.com')
  const [createdEvent, setCreatedEvent] = useState<EventRecord | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    refreshEvents()
  }, [])

  function refreshEvents() {
    fetch('/api/events')
      .then((response) => response.json())
      .then((payload) => setEvents(payload.events || []))
      .catch(() => setEvents([]))
  }

  async function createEvent() {
    setIsCreating(true)
    setCreatedEvent(null)
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        location,
        startsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        organizer: 'Demo Organizer',
        maxReviews,
        whitelistEmails
      })
    })
    const payload = await response.json()
    setIsCreating(false)

    if (response.ok) {
      setCreatedEvent(payload.event)
      refreshEvents()
      setView('home')
    }
  }

  return (
    <main className="phonePage">
      <section className="phoneShell" aria-label="EZRATE mobile app">
        <header className="appTop">
          <div className="appTitle">
            <strong>EZRATE</strong>
            <span>Solana devnet MVP</span>
          </div>
          <appkit-button />
        </header>

        <div className="appContent">
          {view === 'home' ? (
            <>
              <section className="balancePanel">
                <span>Organizer credits</span>
                <strong>120 reviews</strong>
                <span>Credits cover participant voting fees via relayer.</span>
              </section>

              {createdEvent && (
                <a className="notice successLink" href={`/event/${createdEvent.slug}`}>
                  <Check size={18} /> Created: {createdEvent.name}
                </a>
              )}

              <div className="quickGrid">
                <button className="quickAction" onClick={() => setView('create')} type="button">
                  <CalendarPlus size={22} /> Create
                </button>
                <a className="quickAction" href="/event/solana-builder-night">
                  <TicketCheck size={22} /> Review
                </a>
                <button className="quickAction" type="button">
                  <ListChecks size={22} /> Luma CSV
                </button>
              </div>

              <h2 className="sectionTitle">Live events</h2>
              <div className="eventList">
                {events.map((event) => (
                  <a className="eventCard" href={`/event/${event.slug}`} key={event.id}>
                    <div>
                      <strong>{event.name}</strong>
                      <div className="eventMeta">
                        <span>{event.location}</span>
                        <span>
                          {event.reviewCount}/{event.maxReviews} reviews
                        </span>
                      </div>
                    </div>
                    <div className="ratingRow" aria-label={`${event.averageRating.toFixed(1)} stars`}>
                      <Star size={16} fill="currentColor" />
                      <span>{event.averageRating.toFixed(1)}</span>
                      <ArrowRight size={16} />
                    </div>
                  </a>
                ))}
              </div>
            </>
          ) : (
            <section className="createPanel">
              <div>
                <h2>Create event</h2>
                <p>Paste Luma emails now; CSV import can use the same backend later.</p>
              </div>
              <label className="field">
                Event name
                <input value={name} onChange={(event) => setName(event.target.value)} />
              </label>
              <label className="field">
                Location
                <input value={location} onChange={(event) => setLocation(event.target.value)} />
              </label>
              <label className="field">
                Max reviews
                <input
                  min={1}
                  type="number"
                  value={maxReviews}
                  onChange={(event) => setMaxReviews(Number(event.target.value))}
                />
              </label>
              <label className="field">
                Luma whitelist emails
                <textarea
                  value={whitelistEmails}
                  onChange={(event) => setWhitelistEmails(event.target.value)}
                />
              </label>
              <div className="splitActions">
                <button className="button quiet" onClick={() => setView('home')} type="button">
                  Cancel
                </button>
                <button className="button" disabled={isCreating} onClick={createEvent} type="button">
                  {isCreating ? 'Creating' : 'Create'} <Plus size={18} />
                </button>
              </div>
            </section>
          )}
        </div>

        <nav className="tabs" aria-label="App tabs">
          <a className="tab active" href="/app">
            <Home size={19} /> Home
          </a>
          <a className="tab" href="/app">
            <Search size={19} /> Search
          </a>
          <button className="tab" onClick={() => setView('create')} type="button">
            <Plus size={19} /> Create
          </button>
          <a className="tab" href="/app">
            <User size={19} /> Profile
          </a>
        </nav>
      </section>
    </main>
  )
}
