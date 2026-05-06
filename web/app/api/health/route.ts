import { NextResponse } from 'next/server'

// Simple liveness/health probe for monitoring tools (Vercel, uptime checkers,
// load balancers). Intentionally avoids touching the data store so it stays
// cheap and is safe to hit frequently.
export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      service: 'ezrate-web',
      time: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      env: process.env.NODE_ENV ?? 'development'
    },
    {
      status: 200,
      headers: { 'Cache-Control': 'no-store' }
    }
  )
}
