import { headers } from 'next/headers'
import { AppHome } from '@/components/AppHome'
import { LandingPage } from '@/components/LandingPage'
import { OrganizerPortal } from '@/components/OrganizerPortal'

export default async function Home() {
  const host = (await headers()).get('host') || ''

  if (host.startsWith('app.')) {
    return <AppHome mode="reviewer" />
  }

  if (host.startsWith('event.') || host.startsWith('create.')) {
    return <OrganizerPortal />
  }

  return <LandingPage />
}
