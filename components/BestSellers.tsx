'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Keyboard } from 'swiper/modules'
import ProductCard from './ProductCard'
import { Product } from '@/types'
import { useLanguage } from '@/contexts/LanguageContext'
import { translations } from '@/utils/translations'
import { getTopSellers } from '@/lib/api'

export default function BestSellers() {
  const [bestSellers, setBestSellers] = useState<Product[]>([])
  const { language } = useLanguage()
  const t = (key: keyof typeof translations.en) => translations[language][key]

  useEffect(() => {
    const fetchTopSellers = async () => {
      try {
        const data = await getTopSellers()
        // Map the response to your Product type.
        // Assuming the API returns items in the format:
        // { food: { ...productData }, totalQuantity: number }
        const products = data.map((item: any) => ({
          ...item.food,
          totalQuantity: item.totalQuantity,
          id: item.food._id // Adjust according to your product id field
        }))
        setBestSellers(products)
      } catch (error) {
        console.error("Error fetching top sellers:", error)
      }
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
        {t('bestSellers')}
      </motion.h2>
      <div className="relative px-4">
        <Swiper
          modules={[Navigation, Pagination, Keyboard]}
          navigation={{
            prevEl: '.best-sellers-prev',
            nextEl: '.best-sellers-next',
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
          {bestSellers.map((product) => (
            <SwiperSlide key={product.id}>
              <ProductCard {...product} />
            </SwiperSlide>
          ))}
        </Swiper>
        <Button
          variant="outline"
          size="icon"
          className="best-sellers-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="best-sellers-next absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
    </section>
  )
}
