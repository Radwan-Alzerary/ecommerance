import './globals.css'
import { Cairo } from 'next/font/google'
import { Providers } from './providers'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const cairo = Cairo({ subsets: ['latin', 'arabic'] })

export const metadata = {
  title: 'ModernShop - Your Ultimate E-commerce Destination',
  description: 'Discover the latest trends and high-quality products at ModernShop',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${cairo.className} antialiased bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
