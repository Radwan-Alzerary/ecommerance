'use client'

import Link from 'next/link'
import { useLanguage } from '../contexts/LanguageContext'
import { translations, TranslationKey } from '../utils/translations'
import { useEffect, useState } from 'react'
import { getStoreSettingsPublic, type StoreSettingsPublic } from '@/lib/api'

export default function Footer() {
  const { language } = useLanguage()
  const t = (key: TranslationKey) => translations[language][key]
  const [settings, setSettings] = useState<StoreSettingsPublic | null>(null)
  const storeName = settings?.store?.name

  useEffect(() => {
    const lang = language === 'ar' ? 'ar' : 'en'
    getStoreSettingsPublic(lang).then(setSettings).catch(() => setSettings(null))
  }, [language])

  return (
    <footer className="bg-gray-100 dark:bg-gray-800 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      <div>
            <h3 className="text-lg font-semibold mb-4">{t('aboutUs')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
        {settings?.aboutUs || t('aboutUsDescription')}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('quickLinks')}</h3>
            <ul className="space-y-2">
              <li><Link href="/products" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">{t('products')}</Link></li>
              <li><Link href="/categories" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">{t('categories')}</Link></li>
              <li><Link href="/about" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">{t('aboutUs')}</Link></li>
              <li><Link href="/contact" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">{t('contact')}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('customerService')}</h3>
            <ul className="space-y-2">
              <li><Link href="/faq" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">{t('faq')}</Link></li>
              <li><Link href="/shipping" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">{t('shipping')}</Link></li>
              <li><Link href="/returns" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">{t('returns')}</Link></li>
              <li><Link href="/privacy" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">{t('privacyPolicy')}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('connectWithUs')}</h3>
            <ul className="space-y-2">
              {settings?.socialMedia?.facebook && (
                <li><a target="_blank" rel="noopener noreferrer" href={settings.socialMedia.facebook} className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">Facebook</a></li>
              )}
              {settings?.socialMedia?.x && (
                <li><a target="_blank" rel="noopener noreferrer" href={settings.socialMedia.x} className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">Twitter</a></li>
              )}
              {settings?.socialMedia?.instagram && (
                <li><a target="_blank" rel="noopener noreferrer" href={settings.socialMedia.instagram} className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">Instagram</a></li>
              )}
              {settings?.socialMedia?.youtube && (
                <li><a target="_blank" rel="noopener noreferrer" href={settings.socialMedia.youtube} className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">YouTube</a></li>
              )}
              {settings?.socialMedia?.linkedin && (
                <li><a target="_blank" rel="noopener noreferrer" href={settings.socialMedia.linkedin} className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">LinkedIn</a></li>
              )}
              {!settings?.socialMedia && (
                <>
                  <li><a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">Facebook</a></li>
                  <li><a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">Twitter</a></li>
                  <li><a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">Instagram</a></li>
                  <li><a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">LinkedIn</a></li>
                </>
              )}
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            &copy; {new Date().getFullYear()} {storeName ? `${storeName}. ` : ''}{t('allRightsReserved')}
          </p>
        </div>
      </div>
    </footer>
  )
}

