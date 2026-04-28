'use client'

import { CalendarPlus, Home, ListChecks, Plus, Search, Star, TicketCheck, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { EventRecord } from '@/lib/types'

export function AppHome() {
  const [events, setEvents] = useState<EventRecord[]>([])

  useEffect(() => {
    fetch('/api/events')
      .then((response) => response.json())
      .then((payload) => setEvents(payload.events || []))
      .catch(() => setEvents([]))
  }, [])

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
          <section className="balancePanel">
            <span>Organizer credits</span>
            <strong>120 reviews</strong>
            <span>Credits cover participant voting fees via relayer.</span>
          </section>

          <div className="quickGrid">
            <a className="quickAction" href="/app#create">
              <CalendarPlus size={22} /> Create
            </a>
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
                <strong>{event.name}</strong>
                <div className="eventMeta">
                  <span>{event.location}</span>
                  <span>
                    {event.reviewCount}/{event.maxReviews} reviews
                  </span>
                </div>
                <div className="ratingRow" aria-label={`${event.averageRating.toFixed(1)} stars`}>
                  <Star size={16} fill="currentColor" />
                  <span>{event.averageRating.toFixed(1)}</span>
                </div>
              </a>
            ))}
          </div>
        </div>

        <nav className="tabs" aria-label="App tabs">
          <a className="tab active" href="/app">
            <Home size={19} /> Home
          </a>
          <a className="tab" href="/app">
            <Search size={19} /> Search
          </a>
          <a className="tab" href="/app#create">
            <Plus size={19} /> Create
          </a>
          <a className="tab" href="/app">
            <User size={19} /> Profile
          </a>
        </nav>
      </section>
    </main>
  )
}
