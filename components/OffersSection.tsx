'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Keyboard, Autoplay } from 'swiper/modules'
import { Button } from '@/components/ui/button'
import ProductCard from './ProductCard'
import { Product } from '@/types'
import { useLanguage } from '@/contexts/LanguageContext'
import { translations } from '@/utils/translations'
import { getOffersProducts, getWebsiteConfig, WebsiteOffersConfig } from '@/lib/api'

import 'swiper/css'
import 'swiper/css/navigation'

export default function OffersSection() {
  const [offers, setOffers] = useState<Product[]>([])
  const [offersConfig, setOffersConfig] = useState<WebsiteOffersConfig | null>(null)
  const { language } = useLanguage()
  const t = (key: keyof typeof translations.en) => translations[language][key]

  useEffect(() => {
    async function fetchOffers() {
      const config = await getWebsiteConfig()
      const sectionConfig = config?.offers || null

      if (sectionConfig?.enabled === false) {
        setOffers([])
        setOffersConfig(sectionConfig)
        return
      }

      const maxProducts = sectionConfig?.maxProducts || 20
      const products = await getOffersProducts(maxProducts)
      setOffers(products)
      setOffersConfig(sectionConfig)
    }

    fetchOffers()
  }, [])

  if (!offers.length) {
    return null
  }

  return (
    <section className="mb-24 relative">
      <motion.h2
        className="text-3xl font-bold mb-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {offersConfig?.title?.[language] || t('hotDeals')}
      </motion.h2>

      {offersConfig?.subtitle?.[language] && (
        <p className="text-center mb-8 text-lg text-gray-600 dark:text-gray-300">
          {offersConfig.subtitle[language]}
        </p>
      )}

      <div className="relative px-4">
        <Swiper
          modules={[Navigation, Keyboard, Autoplay]}
          navigation={{
            prevEl: '.offers-prev',
            nextEl: '.offers-next',
          }}
          keyboard={{ enabled: true }}
          slidesPerView={offersConfig?.slidesPerView?.mobile || 1}
          spaceBetween={offersConfig?.spaceBetween || 24}
          breakpoints={{
            640: { slidesPerView: offersConfig?.slidesPerView?.tablet || 2 },
            1024: { slidesPerView: offersConfig?.slidesPerView?.desktop || 4 },
            1280: { slidesPerView: offersConfig?.slidesPerView?.desktop || 4 },
          }}
          autoplay={offersConfig?.autoplay ? { delay: 3000, disableOnInteraction: false } : false}
          className="px-4"
        >
          {offers.map((product) => (
            <SwiperSlide key={product._id || product.id}>
              <ProductCard {...product} />
            </SwiperSlide>
          ))}
        </Swiper>

        <Button
          variant="outline"
          size="icon"
          className={`offers-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white ${offersConfig?.showNavigation === false ? 'hidden' : ''}`}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className={`offers-next absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white ${offersConfig?.showNavigation === false ? 'hidden' : ''}`}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
    </section>
  )
}
