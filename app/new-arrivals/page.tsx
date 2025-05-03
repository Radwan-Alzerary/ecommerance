'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ProductCard from '@/components/ProductCard'
import { useLanguage } from '@/contexts/LanguageContext'
import { translations } from '@/utils/translations'
import { dummyProducts } from '@/data/dummyData'
import { Product } from '@/types'

export default function NewArrivalsPage() {
  const [newArrivals, setNewArrivals] = useState<Product[]>([])
  const { language } = useLanguage()
  const t = (key: keyof typeof translations.en) => translations[language][key]

  useEffect(() => {
    // In a real application, you would fetch new arrivals from an API
    // For this example, we'll just sort products by a hypothetical 'dateAdded' field
    const sortedProducts = [...dummyProducts].sort((a, b) => 
      new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
    ).slice(0, 8) // Get the 8 most recent products
    setNewArrivals(sortedProducts)
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">{t('newArrivals')}</h1>
      <p className="text-center mb-8 text-lg">{t('newArrivalsDescription')}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {newArrivals.map((product, index) => (
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
      {newArrivals.length === 0 && (
        <p className="text-center text-gray-500 mt-8">{t('noNewArrivalsAvailable')}</p>
      )}
    </div>
  )
}

