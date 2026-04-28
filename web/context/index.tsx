'use client'

import { createAppKit } from '@reown/appkit/react'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { solanaDevnet } from '@reown/appkit/networks'
import type { ReactNode } from 'react'

const projectId =
  process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694'

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const solanaAdapter = new SolanaAdapter()

createAppKit({
  adapters: [solanaAdapter],
  networks: [solanaDevnet],
  defaultNetwork: solanaDevnet,
  projectId,
  metadata: {
    name: 'EZRATE',
    description: 'On-chain event reviews for Web3 communities',
    url: appUrl,
    icons: [`${appUrl}/icon.png`]
  },
  features: {
    analytics: true,
    email: true,
    socials: ['google']
  }
})

export default function ContextProvider({ children }: { children: ReactNode }) {
  return <>{children}</>
}
