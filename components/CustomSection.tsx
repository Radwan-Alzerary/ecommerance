'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import { CustomSection as CustomSectionType, Product } from '@/types'
import ProductCard from './ProductCard'
import { Button } from './ui/button'
import { useLanguage } from '@/contexts/LanguageContext'
import { useRouter } from 'next/navigation'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

interface CustomSectionProps {
  section: CustomSectionType
}

export default function CustomSection({ section }: CustomSectionProps) {
  const { language } = useLanguage()
  const router = useRouter()

  // Simple translation helper
  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      'addToCart': { en: 'Add to Cart', ar: 'أضف للسلة' },
      'viewAll': { en: 'View All', ar: 'عرض الكل' }
    }
    return translations[key]?.[language] || key
  }

  // Extract products from section data - prioritize activeProducts if available
  const products = section.activeProducts?.map(item => ({
    ...item.productId,
    sectionOrder: item.order,
    sectionFeatured: item.featured
  })) || section.products
    ?.map(item => {
      // Handle both populated and non-populated products
      if (typeof item.productId === 'object') {
        return {
          ...item.productId,
          sectionOrder: item.order,
          sectionFeatured: item.featured
        } as Product & { sectionOrder: number; sectionFeatured: boolean }
      }
      return null
    })
    .filter((product): product is NonNullable<typeof product> => product !== null)
    .sort((a, b) => a.sectionOrder - b.sectionOrder) || []

  // Limit products based on section settings
  const maxItems = section.settings.maxProducts || section.settings.maxItems || products.length
  const displayProducts = products.slice(0, maxItems)

  // Get section name based on language
  const sectionName = section.name[language as keyof typeof section.name] || section.name.en || section.name.ar
  const sectionDescription = section.description?.[language as keyof typeof section.description] || section.description?.en || section.description?.ar

  // Handle view all click
  const handleViewAll = () => {
    router.push(`/sections/${section.slug}`)
  }

  // Get responsive grid columns based on itemsPerRow
  const getGridCols = () => {
    const itemsPerRow = section.settings.itemsPerRow
    if (typeof itemsPerRow === 'object') {
      return `grid-cols-1 sm:grid-cols-${itemsPerRow.tablet} lg:grid-cols-${itemsPerRow.desktop}`
    }
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  }

  const renderGrid = () => (
    <div className={`grid gap-6 ${getGridCols()}`}>
      {displayProducts.map((product) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ProductCard {...product} />
        </motion.div>
      ))}
    </div>
  )

  const renderCarousel = () => {
    const itemsPerRow = section.settings.itemsPerRow
    const slidesPerView = typeof itemsPerRow === 'object' ? itemsPerRow.desktop : 4

    return (
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={section.settings.spaceBetween || 24}
        slidesPerView={1}
        navigation={section.settings.showNavigation}
        pagination={section.settings.showPagination ? { clickable: true } : false}
        autoplay={section.settings.autoplay ? {
          delay: section.settings.autoplayDelay || 5000,
          disableOnInteraction: false,
        } : false}
        breakpoints={{
          640: { slidesPerView: typeof itemsPerRow === 'object' ? itemsPerRow.tablet : 2 },
          1024: { slidesPerView: typeof itemsPerRow === 'object' ? itemsPerRow.desktop : 3 },
          1280: { slidesPerView: slidesPerView },
        }}
        className="w-full"
      >
        {displayProducts.map((product) => (
          <SwiperSlide key={product.id}>
            <ProductCard {...product} />
          </SwiperSlide>
        ))}
      </Swiper>
    )
  }

  const renderList = () => (
    <div className="space-y-4">
      {displayProducts.map((product) => (
        <motion.div
          key={product.id}
          className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-20 h-20 relative overflow-hidden rounded-md">
            {product.image?.url ? (
              <img
                src={product.image.url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-xs">No Image</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{product.name}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
            <p className="text-lg font-bold text-primary mt-1">{product.price} IQD</p>
          </div>
          <Button size="sm">
            {t('addToCart')}
          </Button>
        </motion.div>
      ))}
    </div>
  )

  // Determine display type
  const displayType = section.settings.layout || section.settings.displayType || 'grid'

  return (
    <section className="mb-16 relative">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <motion.h2 
            className="text-3xl font-bold mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {sectionName}
          </motion.h2>
          {sectionDescription && (
            <motion.p
              className="text-gray-600 text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              {sectionDescription}
            </motion.p>
          )}
        </div>
        
        {section.settings.showViewAll && products.length > maxItems && (
          <Button 
            variant="outline" 
            onClick={handleViewAll}
            className="flex items-center gap-2"
          >
            {t('viewAll')}
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Section Content */}
      <div className="px-4">
        {displayProducts.length > 0 ? (
          <>
            {displayType === 'grid' && renderGrid()}
            {displayType === 'carousel' && renderCarousel()}
            {displayType === 'list' && renderList()}
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">لا توجد منتجات متاحة في هذا القسم حالياً</p>
            <p className="text-sm mt-2">No products available in this section currently</p>
          </div>
        )}
      </div>

      {/* View All Button for Mobile */}
      {section.settings.showViewAll && products.length > maxItems && (
        <div className="mt-8 text-center sm:hidden">
          <Button 
            variant="outline" 
            onClick={handleViewAll}
            className="flex items-center gap-2 mx-auto"
          >
            {t('viewAll')}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </section>
  )
}
