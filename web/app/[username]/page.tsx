import { PublicOrganizerPage } from '@/components/PublicOrganizerPage'

export default async function UsernamePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  return <PublicOrganizerPage username={username} />
}
