'use client'

import Image from 'next/image'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, StarHalf, ShoppingCart, Heart, ChevronRight, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '../contexts/CartContext'
import { Product } from '../types'
import RelatedProducts from './RelatedProducts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Keyboard } from 'swiper/modules'
import { useLanguage } from '../contexts/LanguageContext'
import { translations } from '../utils/translations'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

interface ProductProfileProps {
  product: Product
}

export default function ProductProfile({ product }: ProductProfileProps) {
  const [selectedColor, setSelectedColor] = useState(product.colors[0])
  const [selectedSize, setSelectedSize] = useState(product.sizes[0])
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const { addToCart } = useCart()
  const { language } = useLanguage()
  const t = (key: keyof typeof translations.en) => translations[language][key]

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="w-5 h-5 fill-yellow-400 text-yellow-400" />)
    }

    return stars
  }

  // Assuming product.images is an array of image URLs
  const productImages = [product.image, ...Array(3).fill('/placeholder.svg')]

  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-blue-600">{t('home')}</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/products" className="hover:text-blue-600">{t('products')}</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">{product.name}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-12">
        <motion.div 
          className="lg:w-1/2"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Swiper
            modules={[Navigation, Pagination, Keyboard]}
            navigation={{
              nextEl: '.swiper-button-next',
              prevEl: '.swiper-button-prev',
            }}
            pagination={{ clickable: true }}
            keyboard={{ enabled: true }}
            loop
            className="rounded-2xl overflow-hidden bg-gray-100 shadow-lg"
          >
            {productImages.map((image, index) => (
              <SwiperSlide key={index}>
                <div className="relative aspect-square">
                  <Image
                    src={image}
                    alt={`${product.name} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              </SwiperSlide>
            ))}
            <div className="swiper-button-next"></div>
            <div className="swiper-button-prev"></div>
          </Swiper>
        </motion.div>

        <motion.div 
          className="lg:w-1/2"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center">
              {renderStars(product.rating)}
              <span className="ml-2 text-gray-600">({product.rating})</span>
            </div>
            <span className="text-gray-300">|</span>
            <span className="text-gray-600">{t('inStock')}</span>
          </div>
          
          <div className="text-3xl font-bold text-blue-600 mb-8">
           د.ع{product.price.toFixed(2)}
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('color')}</h3>
              <div className="flex gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`
                      w-12 h-12 rounded-full relative transition-transform
                      ${selectedColor === color ? 'ring-2 ring-blue-500 ring-offset-2 scale-110' : 'hover:scale-105'}
                    `}
                  >
                    <span
                      className="absolute inset-0 rounded-full"
                      style={{ backgroundColor: color.toLowerCase() }}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">{t('size')}</h3>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`
                      px-6 py-3 rounded-lg font-medium transition-colors
                      ${selectedSize === size 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}
                    `}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">{t('quantity')}</h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  -
                </button>
                <span className="text-xl font-medium w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={() => addToCart({ ...product, quantity, selectedColor, selectedSize })}
                size="lg"
                className="flex-1 text-lg h-14"
              >
                <ShoppingCart className="mr-2 h-5 w-5" /> {t('addToCart')}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`h-14 w-14 p-0 ${isWishlisted ? 'bg-red-50 border-red-200' : ''}`}
              >
                <Heart className={`h-6 w-6 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
            </div>
          </div>

          <Tabs defaultValue="description" className="mt-12">
            <TabsList className="w-full">
              <TabsTrigger value="description" className="flex-1">{t('description')}</TabsTrigger>
              <TabsTrigger value="specifications" className="flex-1">{t('specifications')}</TabsTrigger>
              <TabsTrigger value="shipping" className="flex-1">{t('shipping')}</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-6">
            <div
  className="text-gray-600 leading-relaxed"
  dangerouslySetInnerHTML={{ __html: product.description }}
/>
            </TabsContent>
            <TabsContent value="specifications" className="mt-6">
              <div className="space-y-4">
                <div className="flex border-b pb-2">
                  <span className="font-medium w-1/3">{t('brand')}</span>
                  <span className="text-gray-600">ModernShop</span>
                </div>
                <div className="flex border-b pb-2">
                  <span className="font-medium w-1/3">{t('material')}</span>
                  <span className="text-gray-600">{t('premiumQuality')}</span>
                </div>
                <div className="flex border-b pb-2">
                  <span className="font-medium w-1/3">{t('warranty')}</span>
                  <span className="text-gray-600">{t('oneYear')}</span>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="shipping" className="mt-6">
              <div className="space-y-4 text-gray-600">
                <p>{t('freeShippingOver50')}</p>
                <p>{t('estimatedDelivery')}</p>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      <div className="mt-24">
        <h2 className="text-2xl font-bold mb-8">{t('youMightAlsoLike')}</h2>
        <RelatedProducts currentProductId={product.id} />
      </div>
    </div>
  )
}

