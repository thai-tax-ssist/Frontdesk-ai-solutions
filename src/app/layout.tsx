import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'FrontDesk AI Solutions — AI Receptionist for Small Businesses',
    template: '%s | FrontDesk AI',
  },
  description:
    'Never miss a call again. FrontDesk AI handles your calls 24/7 — scheduling appointments, answering FAQs, and capturing leads while you focus on your business.',
  keywords: ['AI receptionist', 'virtual receptionist', 'call answering', 'small business', 'appointment scheduling'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://frontdeskai.com',
    siteName: 'FrontDesk AI Solutions',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
