'use client'

import { ArrowLeft, CheckCircle2, Send, ShieldCheck, Star } from 'lucide-react'
import { useState } from 'react'
import type { EventRecord } from '@/lib/types'

export function ReviewForm({ event }: { event: EventRecord }) {
  const [email, setEmail] = useState('demo@ezrate.fun')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState(
    'The event had useful builders, clear sessions, and enough time for networking after the talks. I would recommend keeping the demo area open longer next time.'
  )
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function submitReview() {
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
          <strong>Review</strong>
          <span>Verified attendee</span>
        </div>
        <appkit-button />
      </header>

      <div className="appContent">
        <section className="eventHeroCard">
          <div>
            <span>{event.location}</span>
            <h2>{event.name}</h2>
            <p>
              {event.reviewCount}/{event.maxReviews} reviews collected
            </p>
          </div>
          <div className="eventBadge">
            <ShieldCheck size={18} /> Luma
          </div>
        </section>

        <div className="reviewPanel">
          <div className="formGrid">
            <label className="field">
              Luma email
              <input value={email} onChange={(event) => setEmail(event.target.value)} />
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
              <textarea value={comment} onChange={(event) => setComment(event.target.value)} />
            </label>

            {message && (
              <div className="notice">
                <CheckCircle2 size={18} /> {message}
              </div>
            )}
            {error && <div className="notice error">{error}</div>}

            <button className="button" disabled={isSubmitting} onClick={submitReview} type="button">
              {isSubmitting ? 'Submitting' : 'Submit review'} <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
