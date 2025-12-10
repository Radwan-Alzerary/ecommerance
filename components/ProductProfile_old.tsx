'use client'

import Image from 'next/image'
import { useState } from 'react'
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
  Share2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '../contexts/CartContext'
import { Product } from '../types'
import RelatedProducts from './RelatedProducts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from 'next/link'
import { useLanguage } from '../contexts/LanguageContext'
import { buildAssetUrl } from '@/lib/apiUrl'
import { useFavorites } from '@/contexts/FavoritesContext'

// Simplified translations
const translations = {
  en: {
    home: 'Home',
    products: 'Products',
    addToCart: 'Add to Cart',
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',
    quantity: 'Quantity',
    description: 'Description',
    specifications: 'Specifications',
    reviews: 'Reviews',
    freeShipping: 'Free Shipping',
    warranty: '2 Year Warranty',
    returns: '30 Day Returns',
    loading: 'Loading...'
  },
  ar: {
    home: 'الرئيسية',
    products: 'المنتجات',
    addToCart: 'إضافة للسلة',
    inStock: 'متوفر',
    outOfStock: 'غير متوفر',
    quantity: 'الكمية',
    description: 'الوصف',
    specifications: 'المواصفات',
    reviews: 'التقييمات',
    freeShipping: 'شحن مجاني',
    warranty: 'ضمان سنتين',
    returns: 'إرجاع خلال 30 يوم',
    loading: 'جاري التحميل...'
  }
}

interface ProductProfileProps {
  product: Product
}

export default function ProductProfile({ product }: ProductProfileProps) {
  const { language } = useLanguage()
  const t = translations[language as keyof typeof translations]
  
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0)
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const { addToCart } = useCart()
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites()
  const pid = (product?._id || product?.id || '') as string
  const isFav = pid ? isFavorite(pid) : false

  const handleAddToCart = async () => {
    if (!product) return
    
    setIsAddingToCart(true)
    try {
      await addToCart({
        ...product,
        quantity: quantity
      })
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleToggleFavorite = () => {
    if (!pid) return
    try {
      if (isFav) removeFromFavorites(pid)
      else addToFavorites(product)
    } catch (e) {
      console.error('Toggle favorite failed:', e)
    }
  }

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    const title = product?.name || 'Product'
    const text = product?.description || 'Check this product'
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url })
      } else if (navigator.clipboard && url) {
        await navigator.clipboard.writeText(url)
        // Optional minimal feedback without extra libs
        alert('Link copied to clipboard')
      }
    } catch (e) {
      console.error('Share failed:', e)
    }
  }

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="h-4 w-4 fill-yellow-400 text-yellow-400" />)
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />)
    }

    return stars
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">Product not found</p>
          <Button asChild>
            <Link href="/products">Back to Products</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Build image list (support both product.images and single product.image)
  const rawImages: string[] = []
  if (Array.isArray(product.images) && product.images.length > 0) {
    for (const img of product.images) {
      if (typeof img === 'string') rawImages.push(img)
      else if (img?.url) rawImages.push(img.url)
    }
  } else if (product.image?.url) {
    rawImages.push(product.image.url)
  }
  const productImages = rawImages.length > 0
    ? rawImages.map(i => buildAssetUrl(i)).filter(Boolean)
    : []
  const averageRating = Array.isArray(product.rating) && product.rating.length > 0 
    ? product.rating.reduce((acc: number, curr: number) => acc + curr, 0) / product.rating.length 
    : typeof product.rating === 'number' ? product.rating : 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with breadcrumb - Mobile optimized */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 relative shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center space-x-2 text-sm overflow-x-auto">
            <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap">
              {t.home}
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <Link href="/products" className="text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap">
              {t.products}
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-600 dark:text-gray-400 truncate">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      {/* Main content - Mobile first design */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Product Images - Mobile optimized */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
              {productImages.length > 0 ? (
                <Image
                  src={productImages[selectedImageIndex]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/placeholder.jpg'
                  }}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-zinc-50 to-gray-50 dark:from-slate-950 dark:via-zinc-950 dark:to-gray-950 overflow-hidden">
                  {/* Premium texture overlay */}
                  <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]" style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' /%3E%3C/svg%3E")'
                  }}></div>
                  
                  {/* Subtle radial gradient */}
                  <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-gradient-radial from-slate-200/20 via-transparent to-transparent dark:from-slate-800/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-gradient-radial from-zinc-200/20 via-transparent to-transparent dark:from-zinc-800/10 rounded-full blur-3xl"></div>
                  </div>
                  
                  {/* Elegant geometric pattern */}
                  <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id="luxury-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
                          <circle cx="30" cy="30" r="1" fill="currentColor" opacity="0.4"/>
                          <circle cx="0" cy="0" r="0.5" fill="currentColor" opacity="0.2"/>
                          <circle cx="60" cy="0" r="0.5" fill="currentColor" opacity="0.2"/>
                          <circle cx="0" cy="60" r="0.5" fill="currentColor" opacity="0.2"/>
                          <circle cx="60" cy="60" r="0.5" fill="currentColor" opacity="0.2"/>
                          <path d="M 0 30 L 60 30 M 30 0 L 30 60" stroke="currentColor" strokeWidth="0.25" opacity="0.15"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#luxury-pattern)" />
                    </svg>
                  </div>
                  
                  <div className="relative h-full flex flex-col items-center justify-center p-16">
                    {/* Premium icon presentation */}
                    <div className="relative mb-10">
                      {/* Outer decorative frame */}
                      <div className="absolute -inset-16 border border-slate-200/20 dark:border-slate-800/20 rounded-[2rem]">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rotate-45 bg-slate-200/40 dark:bg-slate-800/40"></div>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 rotate-45 bg-slate-200/40 dark:bg-slate-800/40"></div>
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-slate-200/40 dark:bg-slate-800/40"></div>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 rotate-45 bg-slate-200/40 dark:bg-slate-800/40"></div>
                      </div>
                      
                      {/* Middle frame */}
                      <div className="absolute -inset-10 border border-slate-200/30 dark:border-slate-800/30 rounded-3xl"></div>
                      
                      {/* Main card with premium glassmorphism */}
                      <div className="relative">
                        {/* Subtle shadow */}
                        <div className="absolute inset-0 bg-slate-900/5 dark:bg-slate-100/5 rounded-2xl blur-xl translate-y-4"></div>
                        
                        {/* Glass container */}
                        <div className="relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-2xl p-16">
                          {/* Inner gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-br from-slate-100/30 via-transparent to-zinc-100/30 dark:from-slate-800/20 dark:via-transparent dark:to-zinc-800/20 rounded-2xl"></div>
                          
                          {/* Icon */}
                          <svg 
                            className="w-40 h-40 text-slate-300 dark:text-slate-700 relative" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                            strokeWidth={0.5}
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                            />
                          </svg>
                          
                          {/* Elegant corner details */}
                          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-slate-300/50 dark:border-slate-600/50"></div>
                          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-slate-300/50 dark:border-slate-600/50"></div>
                          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-slate-300/50 dark:border-slate-600/50"></div>
                          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-slate-300/50 dark:border-slate-600/50"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Refined typography */}
                    <div className="relative text-center space-y-4">
                      {/* Top divider */}
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-12 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent dark:via-slate-700"></div>
                        <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                        <div className="w-12 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent dark:via-slate-700"></div>
                      </div>
                      
                      <h3 className="text-base font-medium text-slate-600 dark:text-slate-400 tracking-[0.2em] uppercase">صورة غير متوفرة</h3>
                      <p className="text-sm text-slate-400 dark:text-slate-600 max-w-sm leading-relaxed">لا توجد صورة متاحة لهذا المنتج في الوقت الحالي</p>
                      
                      {/* Bottom divider */}
                      <div className="flex items-center justify-center gap-3 mt-4">
                        <div className="w-12 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent dark:via-slate-700"></div>
                        <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                        <div className="w-12 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent dark:via-slate-700"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {productImages.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index 
                        ? 'border-blue-500' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info - Mobile optimized */}
          <div className="space-y-6">
            {/* Title and Rating */}
            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                {product.name}
              </h1>
              
              {averageRating > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {renderStars(averageRating)}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    ({averageRating.toFixed(1)}) • {Array.isArray(product.rating) ? product.rating.length : '1'} reviews
                  </span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="flex items-center space-x-3">
              <span className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                {product.priceCurrency || '$'}{product.price}
              </span>
              {product.secenderyPrice && product.secenderyPrice > product.price && (
                <span className="text-xl sm:text-2xl text-gray-500 line-through">
                  {product.priceCurrency || '$'}{product.secenderyPrice}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              {product.active !== false ? (
                <>
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-green-600 font-medium">{t.inStock}</span>
                </>
              ) : (
                <>
                  <div className="h-5 w-5 rounded-full bg-red-500" />
                  <span className="text-red-600 font-medium">{t.outOfStock}</span>
                </>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
                  {product.description}
                </p>
              </div>
            )}

            {/* Quantity and Actions */}
            <div className="space-y-6">
              {/* Quantity Selector */}
              <div className="flex items-center space-x-4">
                <span className="font-medium text-gray-900 dark:text-white text-lg">{t.quantity}:</span>
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-6 py-3 font-medium text-lg min-w-[4rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || product.active === false}
                  className="flex-1 h-14 text-lg font-medium"
                  size="lg"
                >
                  {isAddingToCart ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      {t.loading}
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      {t.addToCart}
                    </>
                  )}
                </Button>
                
                <div className="flex space-x-3">
                  <Button
                    variant={isFav ? 'default' : 'outline'}
                    size="icon"
                    className={`h-14 w-14 ${isFav ? 'bg-red-500 hover:bg-red-600 text-white' : ''}`}
                    onClick={handleToggleFavorite}
                    aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                    title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Heart className={`h-6 w-6 ${isFav ? 'fill-white text-white' : ''}`} />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-14 w-14"
                    onClick={handleShare}
                    aria-label="Share product"
                    title="Share product"
                  >
                    <Share2 className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <Truck className="h-6 w-6 text-blue-600 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-300 font-medium">{t.freeShipping}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="h-6 w-6 text-green-600 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-300 font-medium">{t.warranty}</span>
              </div>
              <div className="flex items-center space-x-3">
                <RotateCcw className="h-6 w-6 text-orange-600 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-300 font-medium">{t.returns}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs - Mobile optimized */}
        <div className="mt-12">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-auto">
              <TabsTrigger value="description" className="text-sm sm:text-base py-4 font-medium">
                {t.description}
              </TabsTrigger>
              <TabsTrigger value="specifications" className="text-sm sm:text-base py-4 font-medium">
                {t.specifications}
              </TabsTrigger>
              <TabsTrigger value="reviews" className="text-sm sm:text-base py-4 font-medium">
                {t.reviews}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="mt-6 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                  {product.description || 'No description available.'}
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="specifications" className="mt-6 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="space-y-4">
                <div className="flex justify-between py-4 border-b border-gray-200 dark:border-gray-700">
                  <span className="font-medium text-gray-900 dark:text-white">Price</span>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {product.priceCurrency || '$'}{product.price}
                  </span>
                </div>
                <div className="flex justify-between py-4 border-b border-gray-200 dark:border-gray-700">
                  <span className="font-medium text-gray-900 dark:text-white">Stock Status</span>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {product.active !== false ? t.inStock : t.outOfStock}
                  </span>
                </div>
                {averageRating > 0 && (
                  <div className="flex justify-between py-4">
                    <span className="font-medium text-gray-900 dark:text-white">Rating</span>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {averageRating.toFixed(1)}/5
                    </span>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  {Array.isArray(product.rating) && product.rating.length > 0 
                    ? `${product.rating.length} reviews with average rating of ${averageRating.toFixed(1)}/5`
                    : 'No reviews yet.'
                  }
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        <div className="mt-12">
          <RelatedProducts currentProductId={product._id || product.id || ''} />
        </div>
      </div>
    </div>
  )
}
