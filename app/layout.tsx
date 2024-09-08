import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import dynamic from 'next/dynamic';

const inter = Inter({ subsets: ['latin'] })

const ClientWalletProvider = dynamic(
  () => import('./components/ClientWalletProvider'),
  { ssr: false }
)

export const metadata: Metadata = {
  title: 'Byte News',
  description: 'Stay updated with the latest news and articles in technology and science',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientWalletProvider>{children}</ClientWalletProvider>
      </body>
    </html>
  )
}