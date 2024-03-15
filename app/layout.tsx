import type { Metadata } from 'next'
import localFont from 'next/font/local'
import '@/styles/globals.css'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})

export const metadata: Metadata = {
  title: 'Melodrift | Your Ultimate Music Experience',
  description:
    'Melodrift - A modern music player built with Next.js. Discover, play, and enjoy your favorite tracks with a beautiful interface.',
  keywords: ['music', 'player', 'next.js', 'streaming', 'audio', 'beats'],
  authors: [{ name: 'Pranav Goswami' }],
  viewport: 'width=device-width, initial-scale=1',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
