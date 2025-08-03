'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Keyboard } from 'swiper/modules'
import ProductCard from './ProductCard'
import { getCustomSections } from '@/lib/api'
import { CustomSection as CustomSectionType, Product } from '@/types'
import { useLanguage } from '@/contexts/LanguageContext'

export default function SimpleCustomSections() {
  const [sections, setSections] = useState<CustomSectionType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { language } = useLanguage()

  useEffect(() => {
    async function fetchSections() {
      try {
        setLoading(true)
        setError(null)
        const sectionsData = await getCustomSections()
        
        console.log('📊 جميع الأقسام المستلمة:', sectionsData)
        
        // عرض جميع الأقسام النشطة للاختبار
        const activeSections = sectionsData.filter(section => 
          section.isActive && section.visibility.enabled
        )
        
        console.log('📊 الأقسام النشطة:', activeSections)
        
        setSections(activeSections)
      } catch (error) {
        console.error('❌ خطأ في جلب الأقسام:', error)
        setError('فشل في جلب الأقسام المخصصة')
      } finally {
        setLoading(false)
      }
    }

    fetchSections()
  }, [])

  // Helper function to extract products from section data
  const extractProducts = (section: CustomSectionType): Product[] => {
    const activeProducts = section.activeProducts || section.products || []
    
    return activeProducts.map((item: any) => {
      // Handle both populated and non-populated products
      if (typeof item.productId === 'object') {
        // Populated product
        return {
          ...item.productId,
          id: item.productId._id,
          _id: item.productId._id,
        }
      } else {
        // Non-populated product (should not happen with populateProducts=true)
        console.warn('غير مكتمل - منتج غير محمل:', item)
        return null
      }
    }).filter(Boolean) as Product[]
  }

  if (loading) {
    return (
      <div className="my-16 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="mt-4 text-gray-600">جاري تحميل الأقسام المخصصة...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="my-16 text-center text-red-600">
        <p>{error}</p>
      </div>
    )
  }

  if (sections.length === 0) {
    return (
      <div className="my-16 text-center text-gray-600">
        <p>لا توجد أقسام مخصصة متاحة حالياً</p>
      </div>
    )
  }

  return (
    <div className="my-16">
      {sections.map((section, sectionIndex) => {
        const products = extractProducts(section)
        const sectionName = language === 'ar' ? section.name.ar : section.name.en
        const sectionDescription = section.description && (language === 'ar' ? section.description.ar : section.description.en)
        
        // Skip sections without products
        if (products.length === 0) return null

        return (
          <section key={section._id} className="mb-24 relative">
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: sectionIndex * 0.1 }}
            >
              <h2 className="text-3xl font-bold mb-2">
                {sectionName}
              </h2>
              {sectionDescription && (
                <p className="text-gray-600 max-w-2xl mx-auto">
                  {sectionDescription}
                </p>
              )}
            </motion.div>

            <div className="relative px-4">
              <Swiper
                modules={[Navigation, Pagination, Keyboard]}
                navigation={{
                  prevEl: `.custom-section-${section._id}-prev`,
                  nextEl: `.custom-section-${section._id}-next`,
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
                {products.map((product) => (
                  <SwiperSlide key={product._id || product.id}>
                    <ProductCard {...product} />
                  </SwiperSlide>
                ))}
              </Swiper>
              
              {/* Navigation buttons */}
              <Button
                variant="outline"
                size="icon"
                className={`custom-section-${section._id}-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white`}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={`custom-section-${section._id}-next absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white`}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>

            {/* Debug info (سنزيله لاحقاً) */}
            <motion.div
              className="mt-4 text-center text-sm text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p>📊 {products.length} منتج | 🎯 نوع العرض: {section.settings.layout}</p>
            </motion.div>
          </section>
        )
      })}
    </div>
  )
}