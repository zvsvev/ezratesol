export type Review = {
  id: string
  eventSlug: string
  reviewerHash: string
  rating: number
  comment: string
  commentHash: string
  status: 'pending-relay' | 'confirmed'
  createdAt: string
}

export type EventRecord = {
  id: string
  slug: string
  name: string
  location: string
  startsAt: string
  organizer: string
  maxReviews: number
  whitelistEmails: string[]
  averageRating: number
  reviewCount: number
  onchainEvent?: string
}
