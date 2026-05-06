import { NextResponse } from 'next/server'
import { submitReview } from '@/lib/store'
import { LIMITS, asInt, asString, isEmail } from '@/lib/validate'

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

  const eventSlug = asString(data.eventSlug, 120)
  if (!eventSlug) {
    return NextResponse.json({ message: 'eventSlug is required.' }, { status: 400 })
  }

  if (!isEmail(data.email)) {
    return NextResponse.json({ message: 'A valid email is required.' }, { status: 400 })
  }

  const rating = asInt(data.rating, 1, 5)
  if (rating === null) {
    return NextResponse.json({ message: 'Rating must be an integer from 1 to 5.' }, { status: 400 })
  }

  const comment = asString(data.comment, LIMITS.comment)
  if (!comment) {
    return NextResponse.json(
      { message: `Review must be a non-empty string under ${LIMITS.comment} characters.` },
      { status: 400 }
    )
  }

  const result = await submitReview({
    eventSlug,
    email: String(data.email),
    rating,
    comment
  })

  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: 400 })
  }

  return NextResponse.json(result, { status: 201 })
}
