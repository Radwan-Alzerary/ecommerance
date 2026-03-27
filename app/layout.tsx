import './globals.css'
import { Cairo } from 'next/font/google'
import { Providers } from './providers'
import AuthProvider from '@/components/AuthProvider'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getStoreSettingsServerSide, getCategoriesServerSide } from '@/lib/server-api'
import { getApiUrlAsync } from '@/lib/apiUrl'
import { headers } from 'next/headers'
import { StoreFeaturesProvider } from '@/contexts/StoreFeaturesContext'

const cairo = Cairo({ subsets: ['latin', 'arabic'] })

// Dynamic metadata generation based on store settings
export async function generateMetadata() {
  const [storeSettings, apiBaseUrl] = await Promise.all([
    getStoreSettingsServerSide('en'),
    getApiUrlAsync()
  ])
  
  const projectName = storeSettings?.store?.name?.trim() || 'ModernShop'
    
  const description = storeSettings?.store?.description 
    || storeSettings?.seo?.metaDescription
    || 'Discover the latest trends and high-quality products'

  const rawLogoPath = storeSettings?.logo?.imageUrl?.trim() || ''
  const normalizedLogoPath = rawLogoPath.startsWith('//')
    ? rawLogoPath.replace(/^\/+/, '/')
    : rawLogoPath

  const faviconUrl = normalizedLogoPath
    ? (normalizedLogoPath.startsWith('http://') || normalizedLogoPath.startsWith('https://')
      ? normalizedLogoPath
      : `${apiBaseUrl}${normalizedLogoPath.replace(/^\/+/, '')}`)
    : '/favicon.ico'

  return {
    title: projectName,
    description,
    keywords: storeSettings?.seo?.keywords || ['ecommerce', 'shopping', 'online store'],
    icons: {
      icon: [{ url: faviconUrl }],
      shortcut: [{ url: faviconUrl }],
      apple: [{ url: faviconUrl }]
    }
  }
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

// Function to detect language from headers or default to 'en'
async function getLanguageFromHeaders(): Promise<'ar' | 'en'> {
  const headersList = await headers()
  const acceptLanguage = headersList.get('accept-language') || ''
  
  // Check if Arabic is preferred
  if (acceptLanguage.includes('ar')) {
    return 'ar'
  }
  
  return 'en' // Default to English
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get initial language preference
  const defaultLanguage = await getLanguageFromHeaders()
  
  // Fetch store settings and categories server-side for both languages
  const [storeSettingsAr, storeSettingsEn, initialCategories] = await Promise.all([
    getStoreSettingsServerSide('ar'),
    getStoreSettingsServerSide('en'),
    getCategoriesServerSide()
  ])

  // Prepare initial data for the Header component
  const initialData = {
    storeSettings: {
      ar: storeSettingsAr,
      en: storeSettingsEn
    },
    categories: initialCategories,
    defaultLanguage
  }

  return (
    <html lang={defaultLanguage} suppressHydrationWarning>
      <body className={`${cairo.className} antialiased bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-x-hidden`}>
        <AuthProvider>
          <Providers>
            <StoreFeaturesProvider features={storeSettingsAr?.features || storeSettingsEn?.features}>
            <div className="flex flex-col min-h-screen w-full">
              <Header initialData={initialData} />
              <main className="flex-grow w-full">
                {children}
              </main>
              <Footer />
            </div>
            </StoreFeaturesProvider>
          </Providers>
        </AuthProvider>
      </body>
    </html>
  )
}
