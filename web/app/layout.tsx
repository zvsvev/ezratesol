import type { Metadata } from 'next'
import './globals.css'
import ContextProvider from '@/context'

export const metadata: Metadata = {
  title: 'EZRATE',
  description: 'On-chain event reviews for Web3 communities',
  icons: {
    icon: '/icon.svg',
    apple: '/ezrate-logo.svg'
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ContextProvider>{children}</ContextProvider>
      </body>
    </html>
  )
}
