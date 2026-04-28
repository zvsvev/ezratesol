'use client'

import { Send, Star } from 'lucide-react'
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
    <div className="reviewPanel">
      <div>
        <a href="/app">EZRATE</a>
        <h2>{event.name}</h2>
        <p>
          {event.location} · {event.reviewCount}/{event.maxReviews} submitted
        </p>
      </div>

      <appkit-button />

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

        {message && <div className="notice">{message}</div>}
        {error && <div className="notice error">{error}</div>}

        <button className="button" disabled={isSubmitting} onClick={submitReview} type="button">
          {isSubmitting ? 'Submitting' : 'Submit review'} <Send size={18} />
        </button>
      </div>
    </div>
  )
}
