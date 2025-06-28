// components/ProductCard.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/CartContext'
import { useFavorites } from '@/contexts/FavoritesContext'
import { Star, StarHalf, ShoppingCart, Heart, Eye, Zap, Sparkles } from 'lucide-react'
import { Product } from '@/types'
import { useLanguage } from '@/contexts/LanguageContext'
import { translations } from '@/utils/translations'
import { API_URL } from '@/lib/apiUrl'
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
  const t = (key) => translations[language]?.[key] || key

  const isFav = isFavorite(_id)
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  /* ───── Motion values for advanced animations ───── */
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useTransform(mouseY, [-100, 100], [10, -10])
  const rotateY = useTransform(mouseX, [-100, 100], [-10, 10])

  /* ───── Lazy-render the heavy part only when in view ───── */
  const { ref, inView } = useInView({ rootMargin: '200px', triggerOnce: true })

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    mouseX.set(e.clientX - centerX)
    mouseY.set(e.clientY - centerY)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
    setIsHovered(false)
  }

  const toggleFav = (e) => {
    e.stopPropagation()
    e.preventDefault()
    if (isFav) {
      removeFromFavorites(_id)
    } else {
      addToFavorites(props)
    }
  }

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart({ ...props, quantity: 1 })
  }

  const renderStars = (score) => {
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

  /* ───── Enhanced skeleton with shimmer effect ───── */
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

  /* ───── Enhanced card with 3D effects and glassmorphism ───── */
  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      transition={{ 
        type: "spring",
        stiffness: 300,
        damping: 20
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="group relative flex flex-col h-[480px] overflow-hidden rounded-3xl bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl shadow-black/5 dark:bg-gray-900/80 dark:border-white/10 dark:shadow-black/20"
    >
      {/* Gradient overlay for premium feel */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      {/* Floating elements */}
      <motion.div
        className="absolute top-2 right-2 z-10"
        animate={isHovered ? { 
          rotate: [0, 10, -10, 0],
          scale: [1, 1.1, 1]
        } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Sparkles className="w-4 h-4 text-purple-400 opacity-70" />
      </motion.div>

      {/* Image container with enhanced effects */}
      <Link href={`/products/${_id}`} className="relative block h-[240px] overflow-hidden group/image flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <motion.div
          className="relative h-full w-full"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Image
            src={image?.url ? API_URL + image.url : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'}
            alt={name}
            fill
            loading="lazy"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-all duration-700"
            onLoad={() => setIsImageLoaded(true)}
          />
        </motion.div>

        {/* Enhanced badges and overlays */}
        <div className="absolute inset-0 z-20">
          {/* Rating badge with glassmorphism */}
          {rating !== undefined && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-3 left-3"
            >
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white/20 shadow-lg text-sm font-semibold text-gray-900">
                <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                {rating}
              </div>
            </motion.div>
          )}

          {/* Category badge */}
          {category?.name && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="absolute top-3 right-3"
            >
              <span className="px-2 py-1 text-xs font-medium bg-black/50 text-white rounded-full backdrop-blur-sm">
                {category.name}
              </span>
            </motion.div>
          )}

          {/* Action buttons with enhanced animations */}
          <motion.div
            className="absolute bottom-3 right-3 flex flex-col gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ 
              opacity: isHovered ? 1 : 0,
              x: isHovered ? 0 : 20
            }}
            transition={{ duration: 0.3, staggerChildren: 0.1 }}
          >
            {/* Quick view */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 bg-white/90 backdrop-blur-md hover:bg-white border border-white/20 shadow-lg"
                asChild
              >
                <Link href={`/products/${_id}`}>
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
            </motion.div>

            {/* Add to cart with premium styling */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 bg-blue-500/90 backdrop-blur-md hover:bg-blue-600 text-white border border-blue-300/20 shadow-lg"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </motion.div>

            {/* Enhanced favorite button */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                className={`h-10 w-10 backdrop-blur-md border shadow-lg transition-all duration-300 ${
                  isFav 
                    ? 'bg-red-500/90 hover:bg-red-600 text-white border-red-300/20' 
                    : 'bg-white/90 hover:bg-white border-white/20 text-gray-700'
                }`}
                onClick={toggleFav}
              >
                <motion.div
                  animate={isFav ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <Heart className={`h-4 w-4 transition-all ${isFav ? 'fill-white text-white' : ''}`} />
                </motion.div>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </Link>

      {/* Enhanced info section */}
      <div className="flex flex-col h-[180px] p-4 space-y-2">
        {/* Product name and category - Fixed height */}
        <Link href={`/products/${_id}`} className="block group/link">
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
              {renderStars(rating)}
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
                  <motion.div
                    key={color}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.2 }}
                    className="relative"
                  >
                    <div
                      className="h-4 w-4 rounded-full border-2 border-white shadow-sm cursor-pointer"
                      style={{ backgroundColor: color.toLowerCase() }}
                      title={color}
                    />
                  </motion.div>
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
          <motion.div
            className="sm:hidden"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="sm"
              onClick={handleAddToCart}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg px-3 text-xs h-8"
            >
              <ShoppingCart className="h-3 w-3 mr-1" />
              Add
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Subtle hover glow effect */}
      <motion.div
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: "linear-gradient(45deg, transparent 30%, rgba(59, 130, 246, 0.1) 50%, transparent 70%)",
          filter: "blur(1px)"
        }}
      />
    </motion.article>
  )
}