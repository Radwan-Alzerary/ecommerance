'use client'

import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import {
  Star,
  StarHalf,
  ShoppingCart,
  Heart,
  ChevronRight,
  Check,
  Loader2,
  Plus,
  Minus,
  Truck,
  Shield,
  RotateCcw,
  Zap,
  Eye,
  Share2,
  MessageCircle,
  ThumbsUp,
  Award,
  Sparkles,
  ZoomIn,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '../contexts/CartContext'
import { Product } from '../types'
import RelatedProducts from './RelatedProducts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Keyboard, Thumbs, EffectFade } from 'swiper/modules'
import { useLanguage } from '../contexts/LanguageContext'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/thumbs'
import 'swiper/css/effect-fade'

// Enhanced translations
const translations = {
  en: {
    home: 'Home',
    products: 'Products',
    inStock: 'In Stock',
    color: 'Color',
    size: 'Size',
    quantity: 'Quantity',
    addToCart: 'Add to Cart',
    description: 'Description',
    specifications: 'Specifications',
    shipping: 'Shipping',
    brand: 'Brand',
    material: 'Material',
    premiumQuality: 'Premium Quality',
    warranty: 'Warranty',
    oneYear: '1 Year',
    freeShippingOver50: 'Free shipping on orders over د.ع50.',
    estimatedDelivery: 'Estimated delivery: 2-5 business days.',
    youMightAlsoLike: 'You Might Also Like',
    adding: 'Adding...',
    addedToCart: 'Added!',
    buyNow: 'Buy Now',
    share: 'Share',
    reviews: 'Reviews',
    fastDelivery: 'Fast Delivery',
    securePayment: 'Secure Payment',
    easyReturn: 'Easy Return',
    customerSupport: '24/7 Support',
    verified: 'Verified Purchase',
    recommended: 'Recommended',
    trending: 'Trending',
    limitedStock: 'Limited Stock',
    zoomImage: 'Click to zoom'
  },
  ar: {
    home: 'الرئيسية',
    products: 'المنتجات',
    inStock: 'متوفر بالمخزون',
    color: 'اللون',
    size: 'الحجم',
    quantity: 'الكمية',
    addToCart: 'أضف إلى السلة',
    description: 'الوصف',
    specifications: 'المواصفات',
    shipping: 'الشحن',
    brand: 'العلامة التجارية',
    material: 'الخامة',
    premiumQuality: 'جودة عالية',
    warranty: 'الضمان',
    oneYear: 'سنة واحدة',
    freeShippingOver50: 'شحن مجاني للطلبات التي تزيد عن ٥٠ د.ع.',
    estimatedDelivery: 'التوصيل المتوقع: ٢-٥ أيام عمل.',
    youMightAlsoLike: 'قد يعجبك ايضاً',
    adding: 'جاري الإضافة...',
    addedToCart: 'تمت الإضافة!',
    buyNow: 'اشترِ الآن',
    share: 'مشاركة',
    reviews: 'التقييمات',
    fastDelivery: 'توصيل سريع',
    securePayment: 'دفع آمن',
    easyReturn: 'إرجاع سهل',
    customerSupport: 'دعم على مدار الساعة',
    verified: 'شراء مؤكد',
    recommended: 'مُوصى به',
    trending: 'رائج',
    limitedStock: 'مخزون محدود',
    zoomImage: 'اضغط للتكبير'
  }
}

// Image zoom modal component
const ImageZoomModal = ({ image, alt, isOpen, onClose }) => {
  const modalRef = useRef(null)

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-w-4xl max-h-[90vh] w-full h-full"
        >
          <Image
            src={image}
            alt={alt}
            fill
            className="object-contain"
            quality={100}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20 rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

interface ProductProfileProps {
  product: Product
}

export default function ProductProfile({ product }: ProductProfileProps) {
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '')
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '')
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [thumbsSwiper, setThumbsSwiper] = useState(null)
  const [isZoomOpen, setIsZoomOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const { addToCart } = useCart()
  const { language } = useLanguage()

  const t = (key) => {
    const lang = language
    return translations[lang]?.[key] || translations.en[key]
  }

  const [cartButtonStatus, setCartButtonStatus] = useState('idle')
  const [buyNowStatus, setBuyNowStatus] = useState('idle')

  // 3D tilt effect for product info
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useTransform(mouseY, [-300, 300], [5, -5])
  const rotateY = useTransform(mouseX, [-300, 300], [-5, 5])

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    mouseX.set(e.clientX - centerX)
    mouseY.set(e.clientY - centerY)
  }

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="w-4 h-4 fill-yellow-400 text-yellow-400" />)
    }

    return stars
  }

  // Enhanced product images with fallbacks
  const productImages = product.image ?
    [product.image, ...Array(3).fill('https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] :
    Array(4).fill('https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')

  const handleAddToCart = () => {
    if (cartButtonStatus !== 'idle') return

    setCartButtonStatus('loading')

    setTimeout(() => {
      addToCart({ ...product, quantity, selectedColor, selectedSize })
      setCartButtonStatus('success')
      setTimeout(() => {
        setCartButtonStatus('idle')
      }, 2000)
    }, 800)
  }

  const handleBuyNow = () => {
    if (buyNowStatus !== 'idle') return

    setBuyNowStatus('loading')

    setTimeout(() => {
      addToCart({ ...product, quantity, selectedColor, selectedSize })
      setBuyNowStatus('success')
      // Redirect to checkout
      setTimeout(() => {
        setBuyNowStatus('idle')
      }, 1500)
    }, 600)
  }

  const openImageZoom = (index) => {
    setSelectedImageIndex(index)
    setIsZoomOpen(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Enhanced Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-2 text-sm text-gray-500 mb-8 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl px-6 py-4 border border-gray-200/50 dark:border-gray-700/50"
        >
          <Link href="/" className="hover:text-blue-600 transition-colors font-medium">{t('home')}</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/products" className="hover:text-blue-600 transition-colors font-medium">{t('products')}</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 dark:text-white font-semibold">{product.name}</span>
        </motion.nav>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Enhanced Image Gallery */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Main Image Carousel */}
            <div className="relative group">
              <Swiper
                modules={[Navigation, Pagination, Keyboard, Thumbs, EffectFade]}
                navigation={{
                  nextEl: '.swiper-button-next-main',
                  prevEl: '.swiper-button-prev-main',
                }}
                pagination={{ clickable: true }}
                keyboard={{ enabled: true }}
                thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                effect="fade"
                fadeEffect={{ crossFade: true }}
                loop
                className="rounded-3xl overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50"
                onSlideChange={(swiper) => setSelectedImageIndex(swiper.realIndex)}
              >
                {productImages.map((image, index) => (
                  <SwiperSlide key={index}>
                    <div className="relative aspect-square group cursor-zoom-in" onClick={() => openImageZoom(index)}>
                      <Image
                        src={image}
                        alt={`${product.name} - Image ${index + 1}`}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        quality={90}
                      />
                      {/* Zoom overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileHover={{ opacity: 1, scale: 1 }}
                          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ZoomIn className="w-4 h-4" />
                          {t('zoomImage')}
                        </motion.div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}

                {/* Custom Navigation */}
                <div className="swiper-button-prev-main absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full shadow-lg border border-gray-200/50 dark:border-gray-700/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white dark:hover:bg-gray-700 cursor-pointer">
                  <ChevronRight className="w-5 h-5 rotate-180 text-gray-700 dark:text-gray-300" />
                </div>
                <div className="swiper-button-next-main absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full shadow-lg border border-gray-200/50 dark:border-gray-700/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white dark:hover:bg-gray-700 cursor-pointer">
                  <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </div>
              </Swiper>

              {/* Product badges */}
              <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold"
                >
                  {t('trending')}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold"
                >
                  {t('limitedStock')}
                </motion.div>
              </div>
            </div>

            {/* Thumbnail Gallery */}
            <Swiper
              onSwiper={setThumbsSwiper}
              modules={[Navigation, Thumbs]}
              spaceBetween={12}
              slidesPerView={4}
              watchSlidesProgress
              className="thumbs-swiper"
            >
              {productImages.map((image, index) => (
                <SwiperSlide key={index}>
                  <div className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
                    <Image
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </motion.div>

          {/* Enhanced Product Info */}
          <motion.div
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => {
              mouseX.set(0)
              mouseY.set(0)
            }}
            className="space-y-8"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Product Title and Rating */}
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-3"
              >
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {t('recommended')}
                </div>
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('verified')}</span>
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent leading-tight"
              >
                {product.name}
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-6"
              >
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {renderStars(product.rating || 4.5)}
                  </div>
                  <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">({product.rating || 4.5})</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600 dark:text-gray-400">127 {t('reviews')}</span>
                </div>
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">{t('inStock')}</span>
                </div>
              </motion.div>
            </div>

            {/* Price Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  د.ع{(product.price || 100000).toLocaleString()}
                </div>
                <div className="space-y-1">
                  <div className="text-lg text-gray-500 line-through">د.ع{((product.price || 100000) * 1.2).toLocaleString()}</div>
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1 rounded-lg text-sm font-bold">
                    20% OFF
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {[
                { icon: Truck, text: t('fastDelivery') },
                { icon: Shield, text: t('securePayment') },
                { icon: RotateCcw, text: t('easyReturn') },
                { icon: MessageCircle, text: t('customerSupport') }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-4 text-center border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300"
                >
                  <item.icon className="w-6 h-6 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.text}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Product Options */}
            <div className="space-y-8">
              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('color')}</h3>
                    <span className="text-sm text-gray-600 dark:text-gray-400">- {selectedColor}</span>
                  </div>
                  <div className="flex gap-4">
                    {product.colors.map((color) => (
                      <motion.button
                        key={color}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedColor(color)}
                        className={`relative w-12 h-12 rounded-2xl transition-all duration-300 ${selectedColor === color
                          ? 'ring-4 ring-blue-500 ring-offset-2 dark:ring-offset-gray-800 scale-110'
                          : 'hover:scale-105 hover:shadow-lg'
                          }`}
                      >
                        <span
                          className="absolute inset-0 rounded-2xl border-2 border-white dark:border-gray-700 shadow-lg"
                          style={{ backgroundColor: color.toLowerCase() }}
                        />
                        {selectedColor === color && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            <Check className="w-5 h-5 text-white drop-shadow-lg" />
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-blue-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('size')}</h3>
                    <span className="text-sm text-gray-600 dark:text-gray-400">- {selectedSize}</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map((size) => (
                      <motion.button
                        key={size}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedSize(size)}
                        className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 border-2 ${selectedSize === size
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-lg'
                          : 'bg-white/80 dark:bg-gray-800/80 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700'
                          }`}
                      >
                        {size}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Quantity Selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('quantity')}</h3>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="h-12 w-12 rounded-l-2xl hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="w-16 text-center text-xl font-bold text-gray-900 dark:text-white">
                      {quantity}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(quantity + 1)}
                      className="h-12 w-12 rounded-r-2xl hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Total: د.ع{((product.price || 100000) * quantity).toLocaleString()}
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button
                onClick={handleAddToCart}
                size="lg"
                className="flex-1 h-16 text-lg font-semibold rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300"
                disabled={cartButtonStatus !== 'idle'}
              >
                <AnimatePresence mode="wait">
                  {cartButtonStatus === 'idle' && (
                    <motion.span
                      key="idle"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="h-5 w-5" /> {t('addToCart')}
                    </motion.span>
                  )}
                  {cartButtonStatus === 'loading' && (
                    <motion.span
                      key="loading"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center justify-center gap-2"
                    >
                      <Loader2 className="h-5 w-5 animate-spin" /> {t('adding')}
                    </motion.span>
                  )}
                  {cartButtonStatus === 'success' && (
                    <motion.span
                      key="success"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center justify-center gap-2 text-white"
                    >
                      <Check className="h-5 w-5" /> {t('addedToCart')}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>

              <Button
                onClick={handleBuyNow}
                variant="outline"
                size="lg"
                className="flex-1 h-16 text-lg font-semibold rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={buyNowStatus !== 'idle'}
              >
                <AnimatePresence mode="wait">
                  {buyNowStatus === 'idle' && (
                    <motion.span
                      key="idle"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center justify-center gap-2"
                    >
                      <Zap className="h-5 w-5" /> {t('buyNow')}
                    </motion.span>
                  )}
                  {buyNowStatus === 'loading' && (
                    <motion.span
                      key="loading"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center justify-center gap-2"
                    >
                      <Loader2 className="h-5 w-5 animate-spin" /> Processing...
                    </motion.span>
                  )}
                  {buyNowStatus === 'success' && (
                    <motion.span
                      key="success"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center justify-center gap-2"
                    >
                      <Check className="h-5 w-5" /> Redirecting...
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`h-16 w-16 rounded-2xl border-2 transition-all duration-300 ${isWishlisted
                    ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900'
                    : 'bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                >
                  <Heart className={`h-6 w-6 transition-all ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-700 dark:text-gray-300'}`} />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-16 w-16 rounded-2xl bg-white/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  <Share2 className="h-6 w-6" />
                </Button>
              </div>
            </motion.div>

            {/* Enhanced Product Details Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg overflow-hidden"
            >
              <Tabs defaultValue="description" className="w-full">
                <TabsList className="w-full bg-gray-50/80 dark:bg-gray-700/80 backdrop-blur-md rounded-none border-b border-gray-200/50 dark:border-gray-600/50 h-auto p-0">
                  <TabsTrigger value="description" className="flex-1 py-4 text-base font-semibold rounded-none data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-lg">{t('description')}</TabsTrigger>
                  <TabsTrigger value="specifications" className="flex-1 py-4 text-base font-semibold rounded-none data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-lg">{t('specifications')}</TabsTrigger>
                  <TabsTrigger value="shipping" className="flex-1 py-4 text-base font-semibold rounded-none data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-lg">{t('shipping')}</TabsTrigger>
                </TabsList>
                <div className="p-6">
                  <TabsContent value="description" className="m-0">
                    <div className="text-gray-600 dark:text-gray-300 leading-relaxed prose prose-gray dark:prose-invert max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: product.description || 'This is a premium quality product designed for excellence and durability. Experience the perfect blend of style and functionality.' }} />
                    </div>
                  </TabsContent>
                  <TabsContent value="specifications" className="m-0">
                    <div className="grid gap-4">
                      {[
                        { label: t('brand'), value: 'Oro Eshop' },
                        { label: t('material'), value: t('premiumQuality') },
                        { label: t('warranty'), value: t('oneYear') },
                        { label: 'SKU', value: product._id || 'ORO-001' },
                        { label: 'Weight', value: '1.2 kg' }
                      ].map((spec, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between py-3 border-b border-gray-200/50 dark:border-gray-700/50 last:border-b-0"
                        >
                          <span className="font-semibold text-gray-900 dark:text-white">{spec.label}</span>
                          <span className="text-gray-600 dark:text-gray-400">{spec.value}</span>
                        </motion.div>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="shipping" className="m-0">
                    <div className="space-y-4 text-gray-600 dark:text-gray-300">
                      <p className="flex items-center gap-2">
                        <Truck className="w-5 h-5 text-blue-500" />
                        {t('freeShippingOver50')}
                      </p>
                      <p className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-green-500" />
                        {t('estimatedDelivery')}
                      </p>
                      <p className="flex items-center gap-2">
                        <RotateCcw className="w-5 h-5 text-purple-500" />
                        30-day return policy available
                      </p>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </motion.div>
          </motion.div>
        </div>

        {/* Related Products */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          className="mt-24"
        >
          <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            {t('youMightAlsoLike')}
          </h2>
          <RelatedProducts currentProductId={product.id || product._id} />
        </motion.div>
      </div>

      {/* Image Zoom Modal */}
      <ImageZoomModal
        image={productImages[selectedImageIndex]}
        alt={`${product.name} - Image ${selectedImageIndex + 1}`}
        isOpen={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
      />
    </div>
  )
}