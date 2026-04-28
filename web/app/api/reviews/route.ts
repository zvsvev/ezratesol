import { NextResponse } from 'next/server'
import { submitReview } from '@/lib/store'

export async function POST(request: Request) {
  const body = await request.json()
  const result = await submitReview({
    eventSlug: String(body.eventSlug || ''),
    email: String(body.email || ''),
    rating: Number(body.rating || 0),
    comment: String(body.comment || '')
  })

  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: 400 })
  }

  return NextResponse.json(result, { status: 201 })
}
