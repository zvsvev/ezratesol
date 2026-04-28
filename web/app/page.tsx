import { headers } from 'next/headers'
import { AppHome } from '@/components/AppHome'
import { LandingPage } from '@/components/LandingPage'

export default async function Home() {
  const host = (await headers()).get('host') || ''

  if (host.startsWith('app.')) {
    return <AppHome />
  }

  return <LandingPage />
}
