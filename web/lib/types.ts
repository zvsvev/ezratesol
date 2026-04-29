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

export type RewardMode = 'none' | 'random' | 'pro-rata'
export type RewardAsset = 'SOL' | 'USDC' | 'voucher'

export type EventRecord = {
  id: string
  slug: string
  name: string
  location: string
  startsAt: string
  endsAt: string
  organizer: string
  maxReviews: number
  passcode: string
  bannerImage?: string
  reviewOpensAt: string
  reviewClosesAt: string
  rewardMode: RewardMode
  rewardAsset: RewardAsset
  rewardAmount: string
  creationFeeStatus: 'unpaid' | 'paid'
  whitelistEmails: string[]
  averageRating: number
  reviewCount: number
  onchainEvent?: string
}
