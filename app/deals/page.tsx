'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ProductCard from '@/components/ProductCard'
import { useLanguage } from '@/contexts/LanguageContext'
import { translations } from '@/utils/translations'
import { Product } from '@/types'
import { getAllProduct } from '@/lib/api'

export default function DealsPage() {
  const [deals, setDeals] = useState<Product[]>([])
  const { language } = useLanguage()
  const t = (key: keyof typeof translations.en) => translations[language][key]

  useEffect(() => {
    (async () => {
      try {
        const products = await getAllProduct();
        const dealsProducts = products.filter(p => p.price && Number(p.price).toFixed(2).endsWith('.99'))
        setDeals(dealsProducts.slice(0, 20));
      } catch (e) {
        console.error('Failed to fetch deals products', e);
      }
    })();
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">{t('hotDeals')}</h1>
      <p className="text-center mb-8 text-lg">{t('dealsDescription')}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {deals.map((product, index) => (
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
      {deals.length === 0 && (
        <p className="text-center text-gray-500 mt-8">{t('noDealsAvailable')}</p>
      )}
    </div>
  )
}

