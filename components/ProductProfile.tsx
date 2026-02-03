'use client'

import Image from 'next/image'
import { useState } from 'react'
import {
  Star,
  ShoppingCart,
  Heart,
  ChevronRight,
  Plus,
  Minus,
  Truck,
  Shield,
  RotateCcw,
  Share2,
  Check,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '../contexts/CartContext'
import { Product } from '../types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from 'next/link'
import { useLanguage } from '../contexts/LanguageContext'
import { buildAssetUrl } from '@/lib/apiUrl'
import { useFavorites } from '@/contexts/FavoritesContext'
import RelatedProducts from './RelatedProducts'

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
    loading: 'Loading...',
    category: 'Category',
    share: 'Share'
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
    loading: 'جاري التحميل...',
    category: 'التصنيف',
    share: 'مشاركة'
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
  const [showCopiedToast, setShowCopiedToast] = useState(false)
  const { addToCart } = useCart()
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites()
  const pid = (product?._id || product?.id || (product as any)?.productId || '') as string
  const isFav = pid ? isFavorite(pid) : false

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  // Build image list
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

  const handleAddToCart = () => {
    if (!product) return
    setIsAddingToCart(true)
    try {
      if (!pid) return
      addToCart({ ...product, _id: pid, id: pid, quantity: quantity })
      // تأخير بسيط لإظهار Loading
      setTimeout(() => {
        setIsAddingToCart(false)
      }, 500)
    } catch (error) {
      console.error('Error adding to cart:', error)
      setIsAddingToCart(false)
    }
  }

  const handleToggleFavorite = () => {
    if (!pid) return
    try {
      if (isFav) removeFromFavorites(pid)
      else addToFavorites(product)
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      setShowCopiedToast(true)
      setTimeout(() => setShowCopiedToast(false), 3000)
    } catch (error) {
      console.error('Error copying to clipboard:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950">
      {/* Toast Notification */}
      {showCopiedToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-5 duration-300">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <Check className="w-5 h-5" />
            <span className="font-medium">تم نسخ الرابط بنجاح!</span>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      {/* Breadcrumb */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-800/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              {t.home}
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <Link href="/products" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              {t.products}
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="text-gray-900 dark:text-white font-medium truncate max-w-xs">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Images Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square w-full bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-lg">
              {productImages.length > 0 ? (
                <Image
                  src={productImages[selectedImageIndex]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-zinc-100 dark:from-slate-900 dark:to-zinc-900">
                  <div className="text-center space-y-4">
                    <div className="w-32 h-32 mx-auto rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm flex items-center justify-center border border-slate-200 dark:border-slate-700">
                      <svg className="w-16 h-16 text-slate-300 dark:text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-600">صورة غير متاحة</p>
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index 
                        ? 'border-blue-500 ring-2 ring-blue-500/20 scale-95' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="150px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Section */}
          <div className="space-y-6">
            {/* Category */}
            {product.category?.name && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium">
                {product.category.name}
              </div>
            )}

            {/* Title */}
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight mb-3">
                {product.name}
              </h1>
              
              {/* Rating */}
              {averageRating > 0 && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(averageRating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-300 dark:text-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {averageRating.toFixed(1)} ({Array.isArray(product.rating) ? product.rating.length : 0} {t.reviews})
                  </span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 py-4 border-y border-gray-200 dark:border-gray-800">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">
                {product.price?.toLocaleString()} د.ع
              </span>
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Colors & Sizes */}
            <div className="space-y-4">
              {product.colors && product.colors.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">الألوان المتاحة</p>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <div
                        key={color}
                        className="w-10 h-10 rounded-full border-2 border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 transition-colors cursor-pointer"
                        style={{ backgroundColor: color.toLowerCase() }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">المقاسات المتاحة</p>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        className="px-4 py-2 border-2 border-gray-300 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white rounded-lg text-sm font-medium transition-colors"
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quantity & Actions */}
            <div className="space-y-4 pt-4">
              {/* Quantity Selector */}
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">{t.quantity}</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border-2 border-gray-300 dark:border-gray-700 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 text-center border-none bg-transparent text-lg font-medium focus:outline-none"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  className="flex-1 h-14 text-lg font-semibold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isAddingToCart ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>جاري الإضافة...</span>
                    </div>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      {t.addToCart}
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleToggleFavorite}
                  variant="outline"
                  className="h-14 w-14 rounded-xl border-2 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  <Heart className={`w-5 h-5 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="h-14 w-14 rounded-xl border-2 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                  title={t.share}
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="flex flex-col items-center text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
                <p className="text-xs text-gray-600 dark:text-gray-400">{t.freeShipping}</p>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <Shield className="w-6 h-6 text-green-600 dark:text-green-400 mb-2" />
                <p className="text-xs text-gray-600 dark:text-gray-400">{t.warranty}</p>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <RotateCcw className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2" />
                <p className="text-xs text-gray-600 dark:text-gray-400">{t.returns}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start border-b border-gray-200 dark:border-gray-800 rounded-none bg-transparent p-0 h-auto">
              <TabsTrigger 
                value="description" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 px-6 py-4"
              >
                {t.description}
              </TabsTrigger>
              <TabsTrigger 
                value="specifications" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 px-6 py-4"
              >
                {t.specifications}
              </TabsTrigger>
              <TabsTrigger 
                value="reviews" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 px-6 py-4"
              >
                {t.reviews}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="mt-8">
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {product.description || 'لا يوجد وصف متاح لهذا المنتج.'}
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="specifications" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.category?.name && (
                  <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-800">
                    <span className="font-medium text-gray-900 dark:text-white">{t.category}</span>
                    <span className="text-gray-600 dark:text-gray-400">{product.category.name}</span>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-8">
              <p className="text-gray-600 dark:text-gray-400">لا توجد تقييمات بعد.</p>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {pid && (
          <div className="mt-16">
            <RelatedProducts currentProductId={pid} categoryId={product.category?._id || product.category?.id} />
          </div>
        )}
      </div>
    </div>
  )
}
