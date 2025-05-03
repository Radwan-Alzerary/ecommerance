'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useLanguage } from '../contexts/LanguageContext'
import { translations } from '../utils/translations'

export default function AboutStore() {
  let language = 'en' // Default language
  let t = (key: keyof typeof translations.en) => translations.en[key] // Default translation function

  try {
    const { language: contextLanguage } = useLanguage()
    language = contextLanguage
    t = (key: keyof typeof translations.en) => translations[language][key]
  } catch (error) {
    console.error('Error using useLanguage hook:', error)
  }

  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-4 text-center">{t('aboutModernShop')}</h2>
        <p className="text-center mb-8 max-w-2xl mx-auto">
          {t('aboutStoreDescription')}
        </p>
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">{t('qualityProducts')}</h3>
            <p>{t('qualityProductsDescription')}</p>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">{t('fastDelivery')}</h3>
            <p>{t('fastDeliveryDescription')}</p>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">{t('customerSupport')}</h3>
            <p>{t('customerSupportDescription')}</p>
          </div>
        </div>
        <div className="text-center">
          <Button asChild>
            <Link href="/about">{t('learnMoreAboutUs')}</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

