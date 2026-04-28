import { notFound } from 'next/navigation'
import { ReviewForm } from '@/components/ReviewForm'
import { getEvent } from '@/lib/store'

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await getEvent(slug)

  if (!event) {
    notFound()
  }

  return (
    <main className="reviewPage">
      <ReviewForm event={event} />
    </main>
  )
}
