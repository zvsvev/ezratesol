import { NextResponse } from 'next/server'
import { createEvent, getEventByPasscode, listEvents } from '@/lib/store'
import type { RewardAsset, RewardMode } from '@/lib/types'

export async function GET() {
  return NextResponse.json({ events: await listEvents() })
}

export async function POST(request: Request) {
  const body = await request.json()
  const event = await createEvent({
    name: String(body.name || ''),
    location: String(body.location || ''),
    startsAt: String(body.startsAt || new Date().toISOString()),
    endsAt: String(body.endsAt || new Date().toISOString()),
    organizer: String(body.organizer || 'Demo Organizer'),
    maxReviews: Number(body.maxReviews || 50),
    rewardMode: (body.rewardMode || 'none') as RewardMode,
    rewardAsset: (body.rewardAsset || 'SOL') as RewardAsset,
    rewardAmount: String(body.rewardAmount || ''),
    creationFeeStatus: (body.creationFeeStatus || 'paid') as 'unpaid' | 'paid',
    whitelistEmails: String(body.whitelistEmails || '')
      .split(/[\n,]/)
      .map((email) => email.trim())
  })

  return NextResponse.json({ event }, { status: 201 })
}

export async function PUT(request: Request) {
  const body = await request.json()
  const event = await getEventByPasscode(String(body.passcode || ''))

  if (!event) {
    return NextResponse.json({ message: 'No event found for that passcode.' }, { status: 404 })
  }

  return NextResponse.json({ event })
}
