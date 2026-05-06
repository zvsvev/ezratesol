import { NextResponse } from 'next/server'
import { createEvent, getEventByPasscode, listEvents } from '@/lib/store'
import type { RewardAsset, RewardMode } from '@/lib/types'
import { LIMITS, asEnum, asInt, asIsoDate, asString } from '@/lib/validate'

const REWARD_MODES = ['none', 'random', 'pro-rata'] as const
const REWARD_ASSETS = ['SOL', 'USDC', 'voucher'] as const
const FEE_STATUS = ['unpaid', 'paid'] as const

export async function GET() {
  return NextResponse.json({ events: await listEvents() })
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body.' }, { status: 400 })
  }
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ message: 'Invalid request payload.' }, { status: 400 })
  }
  const data = body as Record<string, unknown>

  const name = asString(data.name, LIMITS.eventName)
  if (!name) {
    return NextResponse.json({ message: 'Event name is required.' }, { status: 400 })
  }

  const location = asString(data.location, LIMITS.location)
  if (!location) {
    return NextResponse.json({ message: 'Location is required.' }, { status: 400 })
  }

  const startsAt = asIsoDate(data.startsAt) || new Date().toISOString()
  const endsAt = asIsoDate(data.endsAt) || startsAt
  if (Date.parse(endsAt) < Date.parse(startsAt)) {
    return NextResponse.json({ message: 'endsAt must be on or after startsAt.' }, { status: 400 })
  }

  const organizer = asString(data.organizer, LIMITS.organizer) || 'Demo Organizer'

  const maxReviews = asInt(data.maxReviews, LIMITS.maxReviewsMin, LIMITS.maxReviewsMax)
  if (maxReviews === null) {
    return NextResponse.json(
      {
        message: `maxReviews must be an integer between ${LIMITS.maxReviewsMin} and ${LIMITS.maxReviewsMax}.`
      },
      { status: 400 }
    )
  }

  const rewardMode = (asEnum(data.rewardMode, REWARD_MODES) || 'none') as RewardMode
  const rewardAsset = (asEnum(data.rewardAsset, REWARD_ASSETS) || 'SOL') as RewardAsset
  const rewardAmount = typeof data.rewardAmount === 'string' ? data.rewardAmount.slice(0, LIMITS.rewardAmount) : ''
  const creationFeeStatus = asEnum(data.creationFeeStatus, FEE_STATUS) || 'paid'

  const rawWhitelist = typeof data.whitelistEmails === 'string' ? data.whitelistEmails : ''
  if (rawWhitelist.length > LIMITS.whitelistRaw) {
    return NextResponse.json({ message: 'Whitelist input is too large.' }, { status: 400 })
  }
  const whitelistEmails = rawWhitelist
    .split(/[\n,]/)
    .map((email) => email.trim())
    .filter(Boolean)
    .slice(0, LIMITS.whitelistEmails)

  const event = await createEvent({
    name,
    location,
    startsAt,
    endsAt,
    organizer,
    maxReviews,
    rewardMode,
    rewardAsset,
    rewardAmount,
    creationFeeStatus,
    whitelistEmails
  })

  return NextResponse.json({ event }, { status: 201 })
}

export async function PUT(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body.' }, { status: 400 })
  }
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ message: 'Invalid request payload.' }, { status: 400 })
  }
  const data = body as Record<string, unknown>
  const passcode = asString(data.passcode, 64)
  if (!passcode) {
    return NextResponse.json({ message: 'Passcode is required.' }, { status: 400 })
  }
  const event = await getEventByPasscode(passcode)

  if (!event) {
    return NextResponse.json({ message: 'No event found for that passcode.' }, { status: 404 })
  }

  return NextResponse.json({ event })
}
