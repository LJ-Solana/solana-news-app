import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import dynamic from 'next/dynamic';
import { Analytics } from "@vercel/analytics/react"

const inter = Inter({ subsets: ['latin'] })

const ClientWalletProvider = dynamic(
  () => import('./components/ClientWalletProvider'),
  { ssr: false }
)

export const metadata: Metadata = {
  title: 'Byte News | Blockchain Verified News',
  description: 'Stay updated with global, economically verified truthful news.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4330197715317619"
     crossOrigin="anonymous"></script>
     <meta name="google-adsense-account" content="ca-pub-4330197715317619"></meta>
      </head>
      <body className={inter.className}>
        <ClientWalletProvider>{children}</ClientWalletProvider>
        <Analytics />
      </body>
    </html>
  )
}