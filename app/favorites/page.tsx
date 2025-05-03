'use client'

import { motion } from 'framer-motion'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { translations } from '@/utils/translations'
import ProductCard from '@/components/ProductCard'

export default function FavoritesPage() {
  const { favorites } = useFavorites()
  const { language } = useLanguage()
  const t = (key: keyof typeof translations.en) => translations[language][key]

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">{t('myFavorites')}</h1>
      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            {t('noFavorites')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <ProductCard {...product} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

