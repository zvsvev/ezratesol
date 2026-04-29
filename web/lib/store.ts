import { promises as fs } from 'fs'
import path from 'path'
import { createHash, randomUUID } from 'crypto'
import type { EventRecord, Review, RewardAsset, RewardMode } from './types'

type Database = {
  events: EventRecord[]
  reviews: Review[]
}

const seedPath = path.join(process.cwd(), 'data', 'seed.json')
const runtimePath = path.join(process.cwd(), 'data', 'runtime.json')

async function readJson(filePath: string): Promise<Database> {
  const raw = await fs.readFile(filePath, 'utf8')
  return JSON.parse(raw) as Database
}

async function loadDb(): Promise<Database> {
  try {
    return normalizeDb(await readJson(runtimePath))
  } catch {
    const seed = normalizeDb(await readJson(seedPath))
    await fs.writeFile(runtimePath, JSON.stringify(seed, null, 2))
    return seed
  }
}

async function saveDb(db: Database) {
  await fs.writeFile(runtimePath, JSON.stringify(db, null, 2))
}

export function sha256Hex(value: string) {
  return createHash('sha256').update(value.trim().toLowerCase()).digest('hex')
}

function normalizeDb(db: Database): Database {
  return {
    ...db,
    events: db.events.map((event) => {
      const isDemoEvent = event.slug === 'solana-builder-night'
      const endsAt = isDemoEvent ? '2026-04-28T12:00:00.000Z' : event.endsAt || event.startsAt || new Date().toISOString()
      return {
        ...event,
        endsAt,
        passcode: isDemoEvent ? 'solananight52' : event.passcode || makePasscode(event.name),
        reviewOpensAt: isDemoEvent ? '2026-04-28T12:00:00.000Z' : event.reviewOpensAt || endsAt,
        reviewClosesAt:
          isDemoEvent
            ? '2026-04-29T12:00:00.000Z'
            : event.reviewClosesAt || new Date(new Date(endsAt).getTime() + 24 * 60 * 60 * 1000).toISOString(),
        rewardMode: isDemoEvent ? 'random' : event.rewardMode || 'none',
        rewardAsset: isDemoEvent ? 'USDC' : event.rewardAsset || 'SOL',
        rewardAmount: isDemoEvent ? '100' : event.rewardAmount || '',
        creationFeeStatus: event.creationFeeStatus || 'paid'
      }
    })
  }
}

export async function listEvents() {
  const db = await loadDb()
  return db.events.map((event) => ({
    ...event,
    whitelistEmails: []
  }))
}

export async function getEvent(slug: string) {
  const db = await loadDb()
  const event = db.events.find((item) => item.slug === slug)
  if (!event) return null
  return {
    ...event,
    whitelistEmails: []
  }
}

export async function getEventByPasscode(passcode: string) {
  const db = await loadDb()
  const normalizedPasscode = passcode.trim().toLowerCase()
  const event = db.events.find((item) => item.passcode.toLowerCase() === normalizedPasscode)
  if (!event) return null
  return {
    ...event,
    whitelistEmails: []
  }
}

function makeSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function makePasscode(name: string) {
  const compact = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 18) || 'event'
  return `${compact}${Math.floor(10 + Math.random() * 90)}`
}

export async function createEvent(input: {
  name: string
  location: string
  startsAt: string
  endsAt: string
  organizer: string
  maxReviews: number
  rewardMode: RewardMode
  rewardAsset: RewardAsset
  rewardAmount: string
  creationFeeStatus: 'unpaid' | 'paid'
  whitelistEmails: string[]
}) {
  const db = await loadDb()
  const slug = makeSlug(input.name)
  const endsAt = new Date(input.endsAt)
  const reviewClosesAt = new Date(endsAt.getTime() + 24 * 60 * 60 * 1000)
  const event: EventRecord = {
    id: randomUUID(),
    slug,
    name: input.name,
    location: input.location,
    startsAt: input.startsAt,
    endsAt: endsAt.toISOString(),
    organizer: input.organizer,
    maxReviews: input.maxReviews,
    passcode: makePasscode(input.name),
    reviewOpensAt: endsAt.toISOString(),
    reviewClosesAt: reviewClosesAt.toISOString(),
    rewardMode: input.rewardMode,
    rewardAsset: input.rewardAsset,
    rewardAmount: input.rewardAmount,
    creationFeeStatus: input.creationFeeStatus,
    whitelistEmails: input.whitelistEmails.map((email) => email.trim().toLowerCase()).filter(Boolean),
    averageRating: 0,
    reviewCount: 0
  }

  db.events.unshift(event)
  await saveDb(db)
  return { ...event, whitelistEmails: [] }
}

export async function submitReview(input: {
  eventSlug: string
  email: string
  rating: number
  comment: string
}) {
  const db = await loadDb()
  const event = db.events.find((item) => item.slug === input.eventSlug)
  if (!event) {
    return { ok: false as const, message: 'Event not found.' }
  }

  const now = Date.now()
  const opensAt = new Date(event.reviewOpensAt).getTime()
  const closesAt = new Date(event.reviewClosesAt).getTime()
  if (now < opensAt) {
    return { ok: false as const, message: 'Review opens after the event ends.' }
  }
  if (now > closesAt) {
    return { ok: false as const, message: 'Review window has closed.' }
  }

  const email = input.email.trim().toLowerCase()
  if (!event.whitelistEmails.includes(email)) {
    return { ok: false as const, message: 'This email is not on the organizer whitelist.' }
  }

  if (input.rating < 1 || input.rating > 5) {
    return { ok: false as const, message: 'Choose a rating from 1 to 5.' }
  }

  if (input.comment.trim().length < 100) {
    return { ok: false as const, message: 'Review must be at least 100 characters.' }
  }

  if (event.reviewCount >= event.maxReviews) {
    return { ok: false as const, message: 'This event has reached its review limit.' }
  }

  const reviewerHash = sha256Hex(`${event.id}:${email}`)
  const alreadyReviewed = db.reviews.some(
    (review) => review.eventSlug === input.eventSlug && review.reviewerHash === reviewerHash
  )

  if (alreadyReviewed) {
    return { ok: false as const, message: 'This attendee already submitted a review.' }
  }

  const review: Review = {
    id: randomUUID(),
    eventSlug: input.eventSlug,
    reviewerHash,
    rating: input.rating,
    comment: input.comment.trim(),
    commentHash: sha256Hex(input.comment),
    status: 'pending-relay',
    createdAt: new Date().toISOString()
  }

  db.reviews.push(review)
  const eventReviews = db.reviews.filter((item) => item.eventSlug === input.eventSlug)
  event.reviewCount = eventReviews.length
  event.averageRating =
    eventReviews.reduce((sum, item) => sum + item.rating, 0) / Math.max(eventReviews.length, 1)

  await saveDb(db)

  return {
    ok: true as const,
    review: {
      id: review.id,
      rating: review.rating,
      status: review.status,
      reviewerHash: review.reviewerHash,
      commentHash: review.commentHash
    }
  }
}
