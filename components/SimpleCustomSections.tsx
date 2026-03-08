'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Keyboard } from 'swiper/modules'
import ProductCard from './ProductCard'
import { getCustomSections, getSectionProducts } from '@/lib/api'
import { CustomSection as CustomSectionType, Product } from '@/types'
import { useLanguage } from '@/contexts/LanguageContext'
import { buildAssetUrl } from '@/lib/apiUrl'

export default function SimpleCustomSections() {
  const [sections, setSections] = useState<CustomSectionType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { language } = useLanguage()

  const resolveProductImage = (product: Product) => {
    if (typeof product.image === 'string') return buildAssetUrl(product.image)
    if (product.image && typeof product.image === 'object' && 'url' in product.image && product.image.url) {
      return buildAssetUrl(product.image.url)
    }
    if (Array.isArray(product.images) && product.images.length > 0) {
      const first = product.images[0]
      if (typeof first === 'string') return buildAssetUrl(first)
      if (first && typeof first === 'object' && 'url' in first && first.url) return buildAssetUrl(first.url)
    }
    return '/img/no-image.png'
  }

  useEffect(() => {
    async function fetchSections() {
      try {
        setLoading(true)
        setError(null)
        const sectionsData = await getCustomSections()

        const homepageSections = sectionsData
          .filter((section) => {
            const requiredRole = section.visibility?.requiredRole || 'public'
            const allowedRole = requiredRole === 'public' || requiredRole === 'customer'

            return (
              section.isActive &&
              !!section.visibility?.enabled &&
              section.visibility?.showOnHomepage !== false &&
              allowedRole
            )
          })
          .sort((a, b) => (a.order || 0) - (b.order || 0))

        const normalizedSections = await Promise.all(
          homepageSections.map(async (section) => {
            const hasInlineProducts =
              (section.activeProducts && section.activeProducts.length > 0) ||
              (section.products && section.products.length > 0)

            if (hasInlineProducts) return section

            try {
              const limit = section.settings?.maxProducts || 12
              const fallback = await getSectionProducts(section._id, {
                page: 1,
                limit,
                sortBy: 'order'
              })

              if (!fallback?.products?.length) return section

              return {
                ...section,
                activeProducts: fallback.products.map((product: Product, index: number) => ({
                  productId: product,
                  order: index,
                  featured: false,
                  addedAt: new Date().toISOString(),
                  _id: `${section._id}-${product._id || product.id || index}`,
                  id: `${section._id}-${product._id || product.id || index}`
                }))
              }
            } catch {
              return section
            }
          })
        )

        setSections(normalizedSections)
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
        const layout = section.settings?.layout || 'grid'

        const renderCompact = () => (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
            {products.map((product) => (
              <Link key={product._id || product.id} href={`/products/${product._id || product.id}`} className="border rounded-xl p-3 flex items-center gap-3 hover:shadow-sm transition">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  <Image src={resolveProductImage(product)} alt={product.name} fill className="object-cover" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-sm truncate">{product.name}</h4>
                  <p className="text-xs text-gray-500 line-clamp-1">{product.description || ''}</p>
                  <p className="text-sm font-bold text-indigo-600 mt-1">{product.price || 0} IQD</p>
                </div>
              </Link>
            ))}
          </div>
        )

        const renderSpotlight = () => {
          const first = products[0]
          const rest = products.slice(1, 5)
          if (!first) return null

          return (
            <div className="px-4 space-y-4">
              <Link href={`/products/${first._id || first.id}`} className="block relative rounded-2xl overflow-hidden min-h-64 border">
                <Image src={resolveProductImage(first)} alt={first.name} fill className="object-cover" />
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute bottom-0 p-6 text-white">
                  <h3 className="text-2xl font-bold mb-1">{first.name}</h3>
                  <p className="text-sm opacity-90 line-clamp-2">{first.description || ''}</p>
                  <p className="text-lg font-bold mt-2">{first.price || 0} IQD</p>
                </div>
              </Link>
              {rest.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  {rest.map((p) => <ProductCard key={p._id || p.id} {...p} />)}
                </div>
              )}
            </div>
          )
        }

        const renderMasonry = () => (
          <div className="px-4 columns-1 md:columns-2 xl:columns-3 gap-4 [column-fill:balance]">
            {products.map((product) => (
              <div key={product._id || product.id} className="mb-4 break-inside-avoid">
                <ProductCard {...product} />
              </div>
            ))}
          </div>
        )

        const renderGrid = () => (
          <div className="px-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product._id || product.id} {...product} />
            ))}
          </div>
        )

        const renderList = () => (
          <div className="px-4 grid grid-cols-1 gap-4">
            {products.map((product) => (
              <Link key={product._id || product.id} href={`/products/${product._id || product.id}`} className="border rounded-xl p-4 flex items-center gap-4 hover:bg-gray-50 transition">
                <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  <Image src={resolveProductImage(product)} alt={product.name} fill className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold truncate">{product.name}</h4>
                  <p className="text-sm text-gray-500 line-clamp-2">{product.description || ''}</p>
                </div>
                <p className="font-bold text-indigo-600">{product.price || 0} IQD</p>
              </Link>
            ))}
          </div>
        )
        
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

            {products.length > 0 ? (
              <>
                {layout === 'carousel' && (
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
                )}
                {layout === 'list' && renderList()}
                {layout === 'masonry' && renderMasonry()}
                {layout === 'spotlight' && renderSpotlight()}
                {layout === 'compact' && renderCompact()}
                {layout === 'grid' && renderGrid()}
              </>
            ) : (
              <div className="px-4 py-10 text-center text-gray-500 border border-dashed border-gray-300 rounded-xl">
                لا توجد منتجات مرتبطة بهذا القسم حالياً
              </div>
            )}

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