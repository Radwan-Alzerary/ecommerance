// components/ProductCard.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/CartContext'
import { useFavorites } from '@/contexts/FavoritesContext'
import { Star, StarHalf, ShoppingCart, Heart, Eye, Zap } from 'lucide-react'
import { Product } from '@/types'
import { useLanguage } from '@/contexts/LanguageContext'
import { translations } from '@/utils/translations'
import { buildAssetUrl } from '@/lib/apiUrl'
import { useInView } from 'react-intersection-observer'
import { useState } from 'react'

interface ProductCardProps extends Product {}

export default function ProductCard(props: ProductCardProps) {
  const {
    _id,
    id,
    name,
    price,
    image,
    rating,
    category,
    colors,
    sizes,
    description,
  } = props

  const { addToCart } = useCart()
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites()
  const { language } = useLanguage()
  const t = (key: string) => (translations as any)[language]?.[key] || key

  const pid = _id || id || ''
  const isFav = isFavorite(pid)
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Lazy-render the heavy part only when in view
  const { ref, inView } = useInView({ rootMargin: '200px', triggerOnce: true })

  const handleMouseMove = () => {}
  const handleMouseLeave = () => { setIsHovered(false) }

  const toggleFav = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (!pid) return
    if (isFav) {
      removeFromFavorites(pid)
    } else {
      addToFavorites(props)
    }
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart({ ...props, quantity: 1 })
  }

  const renderStars = (score: number) => {
    if (score === undefined) return null
    const full = Math.floor(score)
    const half = score % 1 !== 0
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: full }).map((_, i) => (
          <Star key={i} className="h-3 w-3 text-amber-400 fill-amber-400" />
        ))}
        {half && <StarHalf className="h-3 w-3 text-amber-400 fill-amber-400" />}
        <span className="ml-1 text-xs text-gray-600 dark:text-gray-400 font-medium">
          ({score})
        </span>
      </div>
    )
  }

  // Enhanced skeleton with shimmer effect
  if (!inView) {
    return (
      <div
        ref={ref}
        className="h-[420px] w-full overflow-hidden rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700"
      >
        <div className="h-full w-full animate-pulse">
          <div className="h-[240px] bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded-lg animate-pulse" />
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded-lg w-3/4 animate-pulse" />
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded-lg w-1/2 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  // Enhanced card with 3D effects and glassmorphism
  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="group relative flex flex-col h-[480px] overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm"
    >
      {/* Simplified: removed gradient & floating sparkle for performance */}

      {/* Image container */}
  <Link href={`/products/${pid}`} className="relative block h-[240px] overflow-hidden group/image flex-shrink-0">
  <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent z-10" />
        <div className="relative h-full w-full">
          {image?.url ? (
            <Image
              src={buildAssetUrl(image.url)}
              alt={name}
              fill
              loading="lazy"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              onLoad={() => setIsImageLoaded(true)}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50 dark:from-gray-950 dark:via-slate-950 dark:to-zinc-950 overflow-hidden">
              {/* Subtle noise texture for luxury feel */}
              <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]" style={{
                backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' /%3E%3C/svg%3E")'
              }}></div>
              
              {/* Premium gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-100/30 via-transparent to-zinc-100/30 dark:from-slate-800/20 dark:via-transparent dark:to-zinc-800/20"></div>
              
              {/* Refined geometric pattern */}
              <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="premium-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.5"/>
                      <circle cx="20" cy="20" r="0.5" fill="currentColor" opacity="0.3"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#premium-grid)" />
                </svg>
              </div>
              
              <div className="relative h-full flex flex-col items-center justify-center p-8">
                {/* Elegant icon frame */}
                <div className="relative mb-4">
                  {/* Outer decorative border */}
                  <div className="absolute -inset-2 border border-slate-200/40 dark:border-slate-700/40 rounded-2xl"></div>
                  
                  {/* Main icon container */}
                  <div className="relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-lg p-5">
                    {/* Inner subtle glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-100/40 to-transparent dark:from-slate-800/40 rounded-xl"></div>
                    
                    {/* Icon */}
                    <svg 
                      className="w-14 h-14 text-slate-400 dark:text-slate-600 relative" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      strokeWidth={1}
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                      />
                    </svg>
                    
                    {/* Corner accents */}
                    <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-slate-300/60 dark:border-slate-600/60 rounded-tl"></div>
                    <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-slate-300/60 dark:border-slate-600/60 rounded-br"></div>
                  </div>
                </div>
                
                {/* Elegant typography */}
                <div className="text-center space-y-1">
                  <div className="h-px w-8 mx-auto bg-gradient-to-r from-transparent via-slate-300 to-transparent dark:via-slate-700 mb-2"></div>
                  <p className="text-[10px] font-medium text-slate-400 dark:text-slate-600 tracking-[0.2em] uppercase">صورة غير متاحة</p>
                  <div className="h-px w-8 mx-auto bg-gradient-to-r from-transparent via-slate-300 to-transparent dark:via-slate-700 mt-2"></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="absolute inset-0 z-20 pointer-events-none">
          {rating !== undefined && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white/20 shadow text-xs font-semibold text-gray-900">
              <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
              {rating}
            </div>
          )}
        </div>
  <div className="absolute bottom-3 right-3 flex flex-col gap-2 opacity-100">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 bg-white/90 backdrop-blur-md hover:bg-white border border-white/20 shadow-sm"
            asChild
          >
            <Link href={`/products/${pid}`} className="pointer-events-auto"><Eye className="h-4 w-4" /></Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 bg-blue-500/90 backdrop-blur-md hover:bg-blue-600 text-white border border-blue-300/20 shadow-sm"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-10 w-10 backdrop-blur-md border shadow-sm transition-colors duration-200 ${
              isFav 
                ? 'bg-red-500/90 hover:bg-red-600 text-white border-red-300/20' 
                : 'bg-white/90 hover:bg-white border-white/20 text-gray-700'
            }`}
            onClick={toggleFav}
          >
            <Heart className={`h-4 w-4 ${isFav ? 'fill-white text-white' : ''}`} />
          </Button>
        </div>
      </Link>

      {/* Enhanced info section */}
      <div className="flex flex-col h-[180px] p-4 space-y-2">
        {/* Product name and category - Fixed height */}
  <Link href={`/products/${pid}`} className="block group/link">
          <motion.div
            className="h-[60px] flex flex-col justify-start"
            whileHover={{ x: 2 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="font-bold text-base text-gray-900 dark:text-white group-hover/link:text-blue-600 dark:group-hover/link:text-blue-400 transition-colors line-clamp-2 leading-tight h-[40px] overflow-hidden">
              {name}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 leading-relaxed h-[20px] overflow-hidden mt-1">
              {description || 'Premium quality product'}
            </p>
          </motion.div>
        </Link>

        {/* Rating - Fixed height */}
        <div className="flex items-center justify-between h-[20px]">
          {rating !== undefined ? (
            <>
              {renderStars(Array.isArray(rating) ? (rating.length ? rating[0] : 0) : rating)}
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Zap className="w-3 h-3" />
                <span>Popular</span>
              </div>
            </>
          ) : (
            <div className="h-[20px]"></div>
          )}
        </div>

        {/* Color swatches - Fixed height */}
        <div className="flex items-center gap-2 h-[24px]">
          {colors && colors.length > 0 ? (
            <>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Colors:</span>
              <div className="flex gap-1.5">
                {colors.slice(0, 4).map((color, index) => (
                  <div
                    key={color}
                    className="relative"
                  >
                    <div
                      className="h-4 w-4 rounded-full border-2 border-white shadow-sm cursor-pointer"
                      style={{ backgroundColor: color.toLowerCase() }}
                      title={color}
                    />
                  </div>
                ))}
                {colors.length > 4 && (
                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-[9px] font-medium text-gray-600 dark:text-gray-400 border-2 border-white shadow-sm">
                    +{colors.length - 4}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="h-[24px]"></div>
          )}
        </div>

        {/* Spacer to push price section to bottom */}
        <div className="flex-1"></div>

        {/* Price and action section - Fixed height */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800 h-[54px]">
          <div className="flex flex-col justify-center">
            <p className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
              د.ع {price?.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 h-[16px] leading-none">
              {sizes && sizes.length > 0 ? (
                `${sizes.length} size${sizes.length > 1 ? 's' : ''} available`
              ) : (
                'Available now'
              )}
            </p>
          </div>

          {/* Mobile cart button */}
          <div className="sm:hidden">
            <Button
              size="sm"
              onClick={handleAddToCart}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg px-3 text-xs h-8"
            >
              <ShoppingCart className="h-3 w-3 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </div>
    </motion.article>
  )
}