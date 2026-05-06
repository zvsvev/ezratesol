// Lightweight, dependency-free input validation helpers.
// Keeps API surface small and avoids pulling in zod for the MVP.

export const LIMITS = {
  eventName: 96,
  location: 120,
  organizer: 120,
  comment: 2000,
  email: 254,
  rewardAmount: 32,
  whitelistEmails: 1000, // max emails per event
  whitelistRaw: 64 * 1024, // 64 KB raw textarea input
  maxReviewsMin: 1,
  maxReviewsMax: 10000
} as const

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isEmail(value: unknown): value is string {
  return typeof value === 'string' && value.length <= LIMITS.email && EMAIL_RE.test(value.trim())
}

export function asString(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (trimmed.length === 0 || trimmed.length > max) return null
  return trimmed
}

export function asInt(value: unknown, min: number, max: number): number | null {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isInteger(n) || n < min || n > max) return null
  return n
}

export function asIsoDate(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const time = Date.parse(value)
  if (Number.isNaN(time)) return null
  return new Date(time).toISOString()
}

export function asEnum<T extends string>(value: unknown, allowed: readonly T[]): T | null {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : null
}
