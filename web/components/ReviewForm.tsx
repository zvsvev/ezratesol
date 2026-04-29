'use client'

import { useAppKit, useAppKitAccount } from '@reown/appkit/react'
import { ArrowLeft, CheckCircle2, Send, ShieldCheck, Star } from 'lucide-react'
import { useState } from 'react'
import type { EventRecord } from '@/lib/types'

export function ReviewForm({ event }: { event: EventRecord }) {
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()
  const [email, setEmail] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function submitReview() {
    if (!isConnected) {
      setError('Sign in or register before submitting a review.')
      setMessage(null)
      open()
      return
    }

    setIsSubmitting(true)
    setError(null)
    setMessage(null)

    const response = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventSlug: event.slug,
        email,
        rating,
        comment
      })
    })
    const payload = await response.json()
    setIsSubmitting(false)

    if (!response.ok) {
      setError(payload.message || 'Unable to submit review.')
      return
    }

    setMessage(`Review accepted. Commitment is ${payload.review.status}.`)
  }

  return (
    <section className="phoneShell reviewShell" aria-label="EZRATE review app">
      <header className="appTop">
        <a className="iconButton" href="/app" aria-label="Back to app">
          <ArrowLeft size={20} />
        </a>
        <div className="appTitle centered">
          <strong><img src="/ezrate-logo.svg" alt="" /> Review</strong>
          <span>Verified attendee</span>
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

      <div className="appContent">
        <section className="eventHeroCard">
          <div>
            <span>{event.location}</span>
            <h2>{event.name}</h2>
            <p>
              {event.reviewCount}/{event.maxReviews} reviews collected · closes{' '}
              {new Date(event.reviewClosesAt).toLocaleString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            {event.rewardMode !== 'none' && (
              <p>
                Reward: {event.rewardMode} · {event.rewardAmount} {event.rewardAsset}
              </p>
            )}
          </div>
          <div className="eventBadge">
            <ShieldCheck size={18} /> Luma
          </div>
        </section>

        <div className="reviewPanel">
          <div className="formGrid">
            <label className="field">
              Luma email
              <input placeholder="Luma email" value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>

            <div className="field">
              Rating
              <div className="stars" role="radiogroup" aria-label="Rating">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    aria-label={`${value} stars`}
                    className={`starButton ${value <= rating ? 'active' : ''}`}
                    key={value}
                    onClick={() => setRating(value)}
                    type="button"
                  >
                    <Star size={18} fill="currentColor" />
                  </button>
                ))}
              </div>
            </div>

            <label className="field">
              Review
              <textarea
                placeholder="100+ character review"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
              />
            </label>

            {message && (
              <div className="notice">
                <CheckCircle2 size={18} /> {message}
              </div>
            )}
            {error && <div className="notice error">{error}</div>}

            {isConnected ? (
              <button className="button" disabled={isSubmitting} onClick={submitReview} type="button">
                {isSubmitting ? 'Submitting' : 'Submit review'} <Send size={18} />
              </button>
            ) : (
              <button className="button" onClick={() => open()} type="button">
                SIGN IN OR REGISTER <ShieldCheck size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
