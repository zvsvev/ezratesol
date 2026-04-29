'use client'

import { useAppKit, useAppKitAccount } from '@reown/appkit/react'
import {
  ArrowRight,
  CalendarPlus,
  Check,
  Home,
  ListChecks,
  Plus,
  SearchCheck,
  Star,
  TicketCheck,
  User
} from 'lucide-react'
import { useEffect, useState } from 'react'
import type { EventRecord } from '@/lib/types'

export function AppHome() {
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()
  const [events, setEvents] = useState<EventRecord[]>([])
  const [view, setView] = useState<'home' | 'review' | 'create' | 'user'>('home')
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [maxReviews, setMaxReviews] = useState(75)
  const [endsAt, setEndsAt] = useState(() => {
    const date = new Date(Date.now() - 60 * 60 * 1000)
    return date.toISOString().slice(0, 16)
  })
  const [rewardMode, setRewardMode] = useState<'none' | 'random' | 'pro-rata'>('random')
  const [rewardAsset, setRewardAsset] = useState<'SOL' | 'USDC' | 'voucher'>('USDC')
  const [rewardAmount, setRewardAmount] = useState('')
  const [whitelistEmails, setWhitelistEmails] = useState('')
  const [createdEvent, setCreatedEvent] = useState<EventRecord | null>(null)
  const [passcode, setPasscode] = useState('')
  const [passcodeError, setPasscodeError] = useState<string | null>(null)
  const [isFindingEvent, setIsFindingEvent] = useState(false)
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
        startsAt: new Date(endsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
        organizer: 'Demo Organizer',
        maxReviews,
        rewardMode,
        rewardAsset,
        rewardAmount,
        creationFeeStatus: 'paid',
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

  async function findEventByPasscode() {
    setIsFindingEvent(true)
    setPasscodeError(null)
    const response = await fetch('/api/events', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode })
    })
    const payload = await response.json()
    setIsFindingEvent(false)

    if (!response.ok) {
      setPasscodeError(payload.message || 'No event found for that passcode.')
      return
    }

    window.location.href = `/event/${payload.event.slug}`
  }

  function renderWindow(event: EventRecord) {
    const close = new Date(event.reviewClosesAt)
    return `Review closes ${close.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
  }

  return (
    <main className="phonePage">
      <section className="phoneShell" aria-label="EZRATE mobile app">
        <header className="appTop">
          <div className="appTitle">
            <strong>EZRATE</strong>
            <span>Solana devnet MVP</span>
          </div>
          {isConnected ? (
            <button className="authChip" onClick={() => open()} type="button">
              {address?.slice(0, 4)}...{address?.slice(-4)}
            </button>
          ) : (
            <button className="authChip" onClick={() => open()} type="button">
              SIGN IN OR REGISTER
            </button>
          )}
        </header>

        {!isConnected ? (
          <div className="appContent authContent">
            <section className="authGate">
              <div className="authMark">EZ</div>
              <h2>SIGN IN OR REGISTER</h2>
              <p>Access the organizer app, event passcodes, review history, and reward notifications.</p>
              <button className="button" onClick={() => open()} type="button">
                SIGN IN OR REGISTER <ArrowRight size={18} />
              </button>
            </section>
          </div>
        ) : (
        <div className="appContent" key={view}>
          {view === 'home' ? (
            <>
              <section className="balancePanel">
                <span>Organizer credits</span>
                <strong>120 reviews</strong>
                <span>Credits cover participant voting fees via relayer.</span>
              </section>

              {createdEvent && (
                <a className="notice successLink" href={`/event/${createdEvent.slug}`}>
                  <Check size={18} /> Created: {createdEvent.name} · passcode {createdEvent.passcode}
                </a>
              )}

              <div className="quickGrid">
                <button className="quickAction" onClick={() => setView('create')} type="button">
                  <CalendarPlus size={22} /> Create
                </button>
                <button className="quickAction" onClick={() => setView('review')} type="button">
                  <TicketCheck size={22} /> Review
                </button>
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
                        <span>{renderWindow(event)}</span>
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
          ) : view === 'review' ? (
            <section className="createPanel">
              <div>
                <h2>Enter passcode</h2>
                <p>Use the event code from the organizer to open the correct review form.</p>
              </div>
              <label className="field">
                Event passcode
                <input
                  placeholder="Event code"
                  value={passcode}
                  onChange={(event) => setPasscode(event.target.value)}
                />
              </label>
              {passcodeError && <div className="notice error">{passcodeError}</div>}
              <button className="button" disabled={isFindingEvent} onClick={findEventByPasscode} type="button">
                {isFindingEvent ? 'Finding' : 'Find event'} <SearchCheck size={18} />
              </button>
              <div className="hintCard">
                Demo passcode: <strong>solananight52</strong>
              </div>
            </section>
          ) : view === 'create' ? (
            <section className="createPanel">
              <div>
                <h2>Create event</h2>
                <p>Pay the creation fee, generate a review link and passcode, then share it after the event.</p>
              </div>
              <label className="field">
                Event name
                <input placeholder="Event name" value={name} onChange={(event) => setName(event.target.value)} />
              </label>
              <label className="field">
                Location
                <input placeholder="City or venue" value={location} onChange={(event) => setLocation(event.target.value)} />
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
                Event end date and time
                <input value={endsAt} onChange={(event) => setEndsAt(event.target.value)} type="datetime-local" />
              </label>
              <div className="segmented">
                {(['none', 'random', 'pro-rata'] as const).map((mode) => (
                  <button
                    className={rewardMode === mode ? 'active' : ''}
                    key={mode}
                    onClick={() => setRewardMode(mode)}
                    type="button"
                  >
                    {mode}
                  </button>
                ))}
              </div>
              <div className="splitActions">
                <label className="field">
                  Reward type
                  <select value={rewardAsset} onChange={(event) => setRewardAsset(event.target.value as 'SOL' | 'USDC' | 'voucher')}>
                    <option value="SOL">SOL</option>
                    <option value="USDC">USDC</option>
                    <option value="voucher">Voucher</option>
                  </select>
                </label>
                <label className="field">
                  Reward amount
                  <input placeholder="Amount" value={rewardAmount} onChange={(event) => setRewardAmount(event.target.value)} />
                </label>
              </div>
              <label className="field">
                Luma whitelist emails
                <textarea
                  placeholder="Paste emails"
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
          ) : (
            <section className="createPanel">
              <div>
                <h2>User</h2>
                <p>Profile, review history, and reward notifications for attendees.</p>
              </div>
              <div className="profileCard">
                <User size={22} />
                <div>
                  <strong>demo@ezrate.fun</strong>
                  <span>Reown Google login</span>
                </div>
              </div>
              <div className="historyList">
                <div>
                  <span>Review history</span>
                  <strong>Solana Builder Night · pending relay</strong>
                </div>
                <div>
                  <span>Reward notification</span>
                  <strong>Random USDC reward draw after review window closes</strong>
                </div>
                <div>
                  <span>Claim status</span>
                  <strong>Waiting for organizer payout</strong>
                </div>
              </div>
            </section>
          )}
        </div>
        )}

        {isConnected && <nav className="tabs" aria-label="App tabs">
          <button className={`tab ${view === 'home' ? 'active' : ''}`} onClick={() => setView('home')} type="button">
            <Home size={19} /> Home
          </button>
          <button className={`tab ${view === 'review' ? 'active' : ''}`} onClick={() => setView('review')} type="button">
            <TicketCheck size={19} /> Review
          </button>
          <button className={`tab ${view === 'create' ? 'active' : ''}`} onClick={() => setView('create')} type="button">
            <Plus size={19} /> Create
          </button>
          <button className={`tab ${view === 'user' ? 'active' : ''}`} onClick={() => setView('user')} type="button">
            <User size={19} /> User
          </button>
        </nav>}
      </section>
    </main>
  )
}
