import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ContextProvider from '@/context'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'EZRATE',
  description: 'On-chain event reviews for Web3 communities',
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png'
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <ContextProvider>{children}</ContextProvider>
      </body>
    </html>
  )
}
