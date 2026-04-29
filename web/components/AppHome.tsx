'use client'

import { useAppKit, useAppKitAccount } from '@reown/appkit/react'
import {
  ArrowRight,
  CalendarPlus,
  Check,
  Copy,
  Edit3,
  Home,
  Loader2,
  Moon,
  Plus,
  QrCode,
  Save,
  SearchCheck,
  Star,
  Settings,
  Sun,
  TicketCheck,
  User,
  WalletCards
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { EventRecord } from '@/lib/types'

type AppView = 'home' | 'review' | 'create' | 'user'
type Role = 'organizer' | 'reviewer'
type Theme = 'dark' | 'light'

export function AppHome() {
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()
  const [events, setEvents] = useState<EventRecord[]>([])
  const [eventsError, setEventsError] = useState<string | null>(null)
  const [isLoadingEvents, setIsLoadingEvents] = useState(true)
  const [activeEventIndex, setActiveEventIndex] = useState(0)
  const [view, setView] = useState<AppView>('home')
  const [role, setRole] = useState<Role>('organizer')
  const [theme, setTheme] = useState<Theme>('dark')
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [maxReviews, setMaxReviews] = useState(75)
  const [endsAt, setEndsAt] = useState(() => {
    const date = new Date(Date.now() + 2 * 60 * 60 * 1000)
    return date.toISOString().slice(0, 16)
  })
  const [rewardMode, setRewardMode] = useState<'none' | 'random' | 'pro-rata'>('random')
  const [rewardAsset, setRewardAsset] = useState<'SOL' | 'USDC' | 'voucher'>('USDC')
  const [rewardAmount, setRewardAmount] = useState('')
  const [whitelistEmails, setWhitelistEmails] = useState('')
  const [createdEvent, setCreatedEvent] = useState<EventRecord | null>(null)
  const [creationFeePaid, setCreationFeePaid] = useState(false)
  const [copiedText, setCopiedText] = useState<string | null>(null)
  const [passcode, setPasscode] = useState('')
  const [passcodeError, setPasscodeError] = useState<string | null>(null)
  const [previewEvent, setPreviewEvent] = useState<EventRecord | null>(null)
  const [isFindingEvent, setIsFindingEvent] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [displayName, setDisplayName] = useState('EZRATE User')
  const [profileEmail, setProfileEmail] = useState('')
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [rewardAlerts, setRewardAlerts] = useState(true)
  const [reviewReminders, setReviewReminders] = useState(true)
  const [showWalletPublicly, setShowWalletPublicly] = useState(false)

  const activeEvent = events[activeEventIndex]
  const appBaseUrl = typeof window === 'undefined' ? '' : window.location.origin
  const eventShareUrl = createdEvent ? `${appBaseUrl}/event/${createdEvent.slug}` : ''

  useEffect(() => {
    refreshEvents()
  }, [])

  useEffect(() => {
    const savedProfile = window.localStorage.getItem('ezrate-profile')
    const savedTheme = window.localStorage.getItem('ezrate-theme') as Theme | null
    const savedRole = window.localStorage.getItem('ezrate-role') as Role | null
    const savedSettings = window.localStorage.getItem('ezrate-settings')

    if (savedTheme === 'dark' || savedTheme === 'light') setTheme(savedTheme)
    if (savedRole === 'organizer' || savedRole === 'reviewer') setRole(savedRole)
    if (!savedProfile) return

    try {
      const profile = JSON.parse(savedProfile) as { displayName?: string; profileEmail?: string }
      setDisplayName(profile.displayName || 'EZRATE User')
      setProfileEmail(profile.profileEmail || '')
    } catch {
      window.localStorage.removeItem('ezrate-profile')
    }

    if (!savedSettings) return

    try {
      const settings = JSON.parse(savedSettings) as {
        rewardAlerts?: boolean
        reviewReminders?: boolean
        showWalletPublicly?: boolean
      }
      setRewardAlerts(settings.rewardAlerts ?? true)
      setReviewReminders(settings.reviewReminders ?? true)
      setShowWalletPublicly(settings.showWalletPublicly ?? false)
    } catch {
      window.localStorage.removeItem('ezrate-settings')
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem('ezrate-theme', theme)
  }, [theme])

  useEffect(() => {
    window.localStorage.setItem('ezrate-role', role)
  }, [role])

  useEffect(() => {
    window.localStorage.setItem(
      'ezrate-settings',
      JSON.stringify({ rewardAlerts, reviewReminders, showWalletPublicly })
    )
  }, [rewardAlerts, reviewReminders, showWalletPublicly])

  useEffect(() => {
    if (events.length < 2 || view !== 'home') return
    const timer = window.setInterval(() => {
      setActiveEventIndex((current) => (current + 1) % events.length)
    }, 3600)
    return () => window.clearInterval(timer)
  }, [events.length, view])

  function refreshEvents() {
    setIsLoadingEvents(true)
    setEventsError(null)
    fetch('/api/events')
      .then((response) => response.json())
      .then((payload) => {
        setEvents(payload.events || [])
        setActiveEventIndex(0)
      })
      .catch(() => setEventsError('Unable to load events.'))
      .finally(() => setIsLoadingEvents(false))
  }

  async function createEvent() {
    if (!creationFeePaid) return

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
      setCreationFeePaid(false)
      refreshEvents()
      setView('home')
    }
  }

  async function findEventByPasscode() {
    setIsFindingEvent(true)
    setPasscodeError(null)
    setPreviewEvent(null)
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

    setPreviewEvent(payload.event)
  }

  function getReviewState(event: EventRecord) {
    const now = Date.now()
    const opensAt = new Date(event.reviewOpensAt).getTime()
    const closesAt = new Date(event.reviewClosesAt).getTime()

    if (now < opensAt) {
      return {
        status: 'not-open' as const,
        label: `Opens ${formatDate(event.reviewOpensAt)}`,
        canReview: false
      }
    }

    if (now > closesAt) {
      return {
        status: 'closed' as const,
        label: 'Review ended',
        canReview: false
      }
    }

    return {
      status: 'open' as const,
      label: `Closes ${formatDate(event.reviewClosesAt)}`,
      canReview: true
    }
  }

  function formatDate(value: string) {
    return new Date(value).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  function saveProfile() {
    window.localStorage.setItem('ezrate-profile', JSON.stringify({ displayName, profileEmail }))
    setIsEditingProfile(false)
  }

  async function copyToClipboard(value: string, label: string) {
    await navigator.clipboard.writeText(value)
    setCopiedText(label)
    window.setTimeout(() => setCopiedText(null), 1600)
  }

  function resetLocalData() {
    window.localStorage.removeItem('ezrate-profile')
    window.localStorage.removeItem('ezrate-settings')
    setDisplayName('EZRATE User')
    setProfileEmail('')
    setRewardAlerts(true)
    setReviewReminders(true)
    setShowWalletPublicly(false)
    setIsEditingProfile(false)
  }

  const rewardSummary = useMemo(() => {
    if (!activeEvent || activeEvent.rewardMode === 'none') return 'No reward'
    return `${activeEvent.rewardAmount} ${activeEvent.rewardAsset} · ${activeEvent.rewardMode}`
  }, [activeEvent])

  return (
    <main className={`phonePage ${theme === 'light' ? 'themeLight' : ''}`}>
      <section className="phoneShell" aria-label="EZRATE mobile app">
        <header className="appTop">
          <div className="appTitle">
            <strong>EZRATE</strong>
            <span>{role === 'organizer' ? 'Organizer' : 'Reviewer'} mode</span>
          </div>
          <div className="topActions">
            {isConnected ? (
              <button className="authChip" onClick={() => open()} type="button">
                {address?.slice(0, 4)}...{address?.slice(-4)}
              </button>
            ) : (
              <button className="authChip" onClick={() => open()} type="button">
                SIGN IN OR REGISTER
              </button>
            )}
          </div>
        </header>

        {!isConnected ? (
          <div className="appContent authContent">
            <section className="authGate">
              <div className="authMark">EZ</div>
              <h2>SIGN IN OR REGISTER</h2>
              <p>Access event creation, passcodes, review history, and reward notifications.</p>
              <button className="button" onClick={() => open()} type="button">
                SIGN IN OR REGISTER <ArrowRight size={18} />
              </button>
            </section>
          </div>
        ) : (
          <div className="appContent" key={view}>
            {view === 'home' && (
              <>
                <div className="segmented">
                  {(['organizer', 'reviewer'] as const).map((item) => (
                    <button className={role === item ? 'active' : ''} key={item} onClick={() => setRole(item)} type="button">
                      {item}
                    </button>
                  ))}
                </div>

                <section className="balancePanel">
                  <span>{role === 'organizer' ? 'Organizer credits' : 'Reviewer status'}</span>
                  <strong>{role === 'organizer' ? '120 reviews' : '3 reviews'}</strong>
                  <span>
                    {role === 'organizer'
                      ? 'Credits cover participant voting fees via relayer.'
                      : 'Eligible rewards appear after each review window closes.'}
                  </span>
                </section>

                {isLoadingEvents && <div className="skeletonCard"><Loader2 size={18} /> Loading live events</div>}
                {eventsError && <div className="notice error">{eventsError}</div>}

                {activeEvent && (
                  <section className="eventCarousel" aria-label="Featured live events">
                    <a className="eventBanner" href={`/event/${activeEvent.slug}`}>
                      <img src={activeEvent.bannerImage || '/banners/solana-night.svg'} alt="" />
                      <div className="bannerOverlay">
                        <span>{activeEvent.location}</span>
                        <strong>{activeEvent.name}</strong>
                        <div className="bannerMeta">
                          <span>{activeEvent.reviewCount}/{activeEvent.maxReviews} reviews</span>
                          <span>{rewardSummary}</span>
                        </div>
                      </div>
                    </a>
                    <div className="carouselDots" aria-hidden="true">
                      {events.map((event, index) => (
                        <button
                          className={index === activeEventIndex ? 'active' : ''}
                          key={event.id}
                          onClick={() => setActiveEventIndex(index)}
                          type="button"
                        />
                      ))}
                    </div>
                  </section>
                )}

                {createdEvent && (
                  <section className="sharePanel">
                    <div>
                      <h2>Event ready</h2>
                      <p>{createdEvent.name}</p>
                    </div>
                    <div className="qrMock" aria-hidden="true">
                      <QrCode size={58} />
                    </div>
                    <button className="copyRow" onClick={() => copyToClipboard(createdEvent.passcode, 'Passcode copied')} type="button">
                      <span>Passcode</span>
                      <strong>{createdEvent.passcode}</strong>
                      <Copy size={16} />
                    </button>
                    <button className="copyRow" onClick={() => copyToClipboard(eventShareUrl, 'Link copied')} type="button">
                      <span>Link</span>
                      <strong>{eventShareUrl.replace(/^https?:\/\//, '')}</strong>
                      <Copy size={16} />
                    </button>
                    {copiedText && <div className="notice"><Check size={18} /> {copiedText}</div>}
                  </section>
                )}

                <div className="quickGrid">
                  <button className="quickAction" onClick={() => setView('create')} type="button">
                    <CalendarPlus size={22} /> Create
                  </button>
                  <button className="quickAction" onClick={() => setView('review')} type="button">
                    <TicketCheck size={22} /> Review
                  </button>
                  <button className="quickAction" onClick={() => setView('user')} type="button">
                    <User size={22} /> Profile
                  </button>
                </div>

                <h2 className="sectionTitle">Live events</h2>
                <div className="eventList">
                  {events.map((event) => {
                    const reviewState = getReviewState(event)
                    return (
                      <a className="eventCard" href={`/event/${event.slug}`} key={event.id}>
                        <div>
                          <strong>{event.name}</strong>
                          <div className="eventMeta">
                            <span>{event.location}</span>
                            <span>{event.reviewCount}/{event.maxReviews} reviews</span>
                            <span>{reviewState.label}</span>
                          </div>
                        </div>
                        <div className="ratingRow" aria-label={`${event.averageRating.toFixed(1)} stars`}>
                          <Star size={16} fill="currentColor" />
                          <span>{event.averageRating.toFixed(1)}</span>
                          <ArrowRight size={16} />
                        </div>
                      </a>
                    )
                  })}
                </div>
              </>
            )}

            {view === 'review' && (
              <section className="createPanel">
                <div>
                  <h2>Enter passcode</h2>
                  <p>Preview the event before opening the review form.</p>
                </div>
                <label className="field">
                  Event passcode
                  <input placeholder="Event code" value={passcode} onChange={(event) => setPasscode(event.target.value)} />
                </label>
                {passcodeError && <div className="notice error">{passcodeError}</div>}
                <button className="button" disabled={isFindingEvent} onClick={findEventByPasscode} type="button">
                  {isFindingEvent ? 'Finding' : 'Find event'} <SearchCheck size={18} />
                </button>
                <div className="hintCard">
                  Demo passcode: <strong>solananight52</strong>
                </div>
                {previewEvent && (
                  <div className="previewCard">
                    <img src={previewEvent.bannerImage || '/banners/solana-night.svg'} alt="" />
                    <strong>{previewEvent.name}</strong>
                    <span>{previewEvent.location} · {getReviewState(previewEvent).label}</span>
                    <span>
                      Reward: {previewEvent.rewardMode === 'none' ? 'No reward' : `${previewEvent.rewardAmount} ${previewEvent.rewardAsset}`}
                    </span>
                    <a className={`button ${getReviewState(previewEvent).canReview ? '' : 'quiet'}`} href={`/event/${previewEvent.slug}`}>
                      {getReviewState(previewEvent).canReview ? 'Open review' : 'View event'} <ArrowRight size={18} />
                    </a>
                  </div>
                )}
              </section>
            )}

            {view === 'create' && (
              <section className="createPanel">
                <div>
                  <h2>Create event</h2>
                  <p>Pay the creation fee before EZRATE generates the passcode and event link.</p>
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
                  <input min={1} type="number" value={maxReviews} onChange={(event) => setMaxReviews(Number(event.target.value))} />
                </label>
                <label className="field">
                  Event end date and time
                  <input value={endsAt} onChange={(event) => setEndsAt(event.target.value)} type="datetime-local" />
                </label>
                <div className="segmented">
                  {(['none', 'random', 'pro-rata'] as const).map((mode) => (
                    <button className={rewardMode === mode ? 'active' : ''} key={mode} onClick={() => setRewardMode(mode)} type="button">
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
                  Whitelist emails
                  <textarea placeholder="Paste Luma emails" value={whitelistEmails} onChange={(event) => setWhitelistEmails(event.target.value)} />
                </label>
                <div className={`feePanel ${creationFeePaid ? 'paid' : ''}`}>
                  <WalletCards size={20} />
                  <div>
                    <strong>{creationFeePaid ? 'Creation fee paid' : 'Creation fee required'}</strong>
                    <span>Covers on-chain storage and sponsored review transactions.</span>
                  </div>
                </div>
                <div className="splitActions">
                  <button className="button quiet" onClick={() => setView('home')} type="button">
                    Cancel
                  </button>
                  {creationFeePaid ? (
                    <button className="button" disabled={isCreating} onClick={createEvent} type="button">
                      {isCreating ? 'Creating' : 'Create'} <Plus size={18} />
                    </button>
                  ) : (
                    <button className="button" onClick={() => setCreationFeePaid(true)} type="button">
                      Pay fee <WalletCards size={18} />
                    </button>
                  )}
                </div>
              </section>
            )}

            {view === 'user' && (
              <section className="createPanel">
                <div>
                  <h2>User</h2>
                  <p>Profile, review history, and reward notifications.</p>
                </div>
                <div className="profileCard">
                  <User size={22} />
                  <div>
                    <strong>{displayName}</strong>
                    <span>{showWalletPublicly ? address || 'Wallet not connected' : 'Wallet hidden on profile'}</span>
                  </div>
                </div>
                <div className="profileEdit">
                  <label className="field">
                    Display name
                    <input disabled={!isEditingProfile} placeholder="Display name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
                  </label>
                  <label className="field">
                    Email
                    <input disabled={!isEditingProfile} placeholder="Email" value={profileEmail} onChange={(event) => setProfileEmail(event.target.value)} />
                  </label>
                  {isEditingProfile ? (
                    <button className="button" onClick={saveProfile} type="button">
                      Save profile <Save size={18} />
                    </button>
                  ) : (
                    <button className="button quiet" onClick={() => setIsEditingProfile(true)} type="button">
                      Edit profile <Edit3 size={18} />
                    </button>
                  )}
                </div>
                <div className="settingsPanel">
                  <div className="settingsTitle">
                    <Settings size={18} />
                    <strong>Settings</strong>
                  </div>
                  <div className="settingRow">
                    <div>
                      <strong>Theme</strong>
                      <span>{theme === 'dark' ? 'Dark mode' : 'Light mode'}</span>
                    </div>
                    <div className="miniSwitch">
                      <button className={theme === 'dark' ? 'active' : ''} onClick={() => setTheme('dark')} type="button">
                        <Moon size={16} /> Dark
                      </button>
                      <button className={theme === 'light' ? 'active' : ''} onClick={() => setTheme('light')} type="button">
                        <Sun size={16} /> Light
                      </button>
                    </div>
                  </div>
                  <div className="settingRow">
                    <div>
                      <strong>Default role</strong>
                      <span>{role === 'organizer' ? 'Organizer dashboard first' : 'Reviewer dashboard first'}</span>
                    </div>
                    <div className="miniSwitch">
                      <button className={role === 'organizer' ? 'active' : ''} onClick={() => setRole('organizer')} type="button">
                        EO
                      </button>
                      <button className={role === 'reviewer' ? 'active' : ''} onClick={() => setRole('reviewer')} type="button">
                        User
                      </button>
                    </div>
                  </div>
                  <label className="toggleRow">
                    <span>
                      <strong>Reward alerts</strong>
                      <em>Notify when a reward is won or claimable.</em>
                    </span>
                    <input checked={rewardAlerts} onChange={(event) => setRewardAlerts(event.target.checked)} type="checkbox" />
                  </label>
                  <label className="toggleRow">
                    <span>
                      <strong>Review reminders</strong>
                      <em>Remind me when a passcode review window opens.</em>
                    </span>
                    <input checked={reviewReminders} onChange={(event) => setReviewReminders(event.target.checked)} type="checkbox" />
                  </label>
                  <label className="toggleRow">
                    <span>
                      <strong>Show wallet</strong>
                      <em>Display wallet address in profile surfaces.</em>
                    </span>
                    <input checked={showWalletPublicly} onChange={(event) => setShowWalletPublicly(event.target.checked)} type="checkbox" />
                  </label>
                  <button className="button quiet" onClick={resetLocalData} type="button">
                    Reset local profile
                  </button>
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

        {isConnected && (
          <nav className="tabs" aria-label="App tabs">
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
          </nav>
        )}
      </section>
    </main>
  )
}
