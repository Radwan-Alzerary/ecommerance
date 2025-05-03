'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Keyboard } from 'swiper/modules'
import ProductCard from './ProductCard'
import { Product } from '../types'
import { useLanguage } from '../contexts/LanguageContext'
import { translations } from '../utils/translations'
import { getTopSellers } from '@/lib/api'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

export default function TopSellers() {
  const [topSellers, setTopSellers] = useState<Product[]>([])
  const { language } = useLanguage()
  const t = (key: keyof typeof translations.en) => translations[language][key]

  useEffect(() => {
    async function fetchTopSellers() {
      const products = await getTopSellers()
      setTopSellers(products)
    }
    fetchTopSellers()
  }, [])

  return (
    <section className="mb-24 relative">
      <motion.h2 
        className="text-3xl font-bold mb-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {t('topSellers')}
      </motion.h2>
      <div className="relative px-4">
        <Swiper
          modules={[Navigation, Pagination, Keyboard]}
          navigation={{
            prevEl: '.top-sellers-prev',
            nextEl: '.top-sellers-next',
          }}
          keyboard={{ enabled: true }}
          slidesPerView={1}
          spaceBetween={24}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1280: { slidesPerView: 4 },
          }}
          className="px-4"
        >
          {topSellers.map((product) => (
            <SwiperSlide key={product.id}>
              <ProductCard {...product} />
            </SwiperSlide>
          ))}
        </Swiper>
        <Button
          variant="outline"
          size="icon"
          className="top-sellers-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="top-sellers-next absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
    </section>
  )
}
