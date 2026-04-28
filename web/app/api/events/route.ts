import { NextResponse } from 'next/server'
import { createEvent, listEvents } from '@/lib/store'

export async function GET() {
  return NextResponse.json({ events: await listEvents() })
}

export async function POST(request: Request) {
  const body = await request.json()
  const event = await createEvent({
    name: String(body.name || ''),
    location: String(body.location || ''),
    startsAt: String(body.startsAt || new Date().toISOString()),
    organizer: String(body.organizer || 'Demo Organizer'),
    maxReviews: Number(body.maxReviews || 50),
    whitelistEmails: String(body.whitelistEmails || '')
      .split(/[\n,]/)
      .map((email) => email.trim())
  })

  return NextResponse.json({ event }, { status: 201 })
}
