'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { useLanguage } from '../contexts/LanguageContext'
import { translations } from '../utils/translations'
import { Category } from '@/types'
import { ArrowRight, Sparkles, TrendingUp, Star } from 'lucide-react'
import { useState } from 'react'

interface CategoryCardProps extends Category {}

// Fallback images for different categories
const getCategoryFallbackImage = (categoryName: string) => {
  const category = categoryName.toLowerCase()
  
  if (category.includes('fashion') || category.includes('clothing') || category.includes('wear')) {
    return 'https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  } else if (category.includes('tech') || category.includes('electronic') || category.includes('gadget')) {
    return 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  } else if (category.includes('beauty') || category.includes('cosmetic')) {
    return 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  } else if (category.includes('home') || category.includes('furniture')) {
    return 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  } else if (category.includes('sport') || category.includes('fitness')) {
    return 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  } else if (category.includes('book') || category.includes('education')) {
    return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  } else {
    return 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  }
}

const ImageWithFallback = ({ src, fallbackSrc, alt, ...props }) => {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (!hasError && fallbackSrc) {
      setHasError(true)
      setImgSrc(fallbackSrc)
    }
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      onError={handleError}
      {...props}
    />
  )
}

export default function CategoryCard({ name, image, _id }: CategoryCardProps) {
  const { language } = useLanguage()
  const t = (key) => translations[language]?.[key] || key
  const [isHovered, setIsHovered] = useState(false)

  // Motion values for 3D tilt effect
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useTransform(mouseY, [-100, 100], [8, -8])
  const rotateY = useTransform(mouseX, [-100, 100], [-8, 8])

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

  const fallbackImage = getCategoryFallbackImage(name)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -12, scale: 1.02 }}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      transition={{ 
        type: "spring",
        stiffness: 300,
        damping: 25
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="group relative overflow-hidden rounded-3xl shadow-2xl shadow-black/10 dark:shadow-black/30"
    >
      <Link href={`/categories/${_id}`} className="block">
        <div className="relative h-64 w-full overflow-hidden">
          {/* Main image with parallax effect */}
          <motion.div
            className="absolute inset-0 scale-110"
            whileHover={{ scale: 1.15 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <ImageWithFallback
              src={image || "/placeholder.svg"}
              fallbackSrc={fallbackImage}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </motion.div>

          {/* Dynamic gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-purple-900/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Animated mesh gradient overlay */}
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-30"
            initial={false}
            animate={isHovered ? {
              background: [
                "radial-gradient(circle at 20% 50%, #8b5cf6 0%, transparent 50%)",
                "radial-gradient(circle at 80% 50%, #ec4899 0%, transparent 50%)",
                "radial-gradient(circle at 40% 70%, #06b6d4 0%, transparent 50%)"
              ]
            } : {}}
            transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
          />

          {/* Floating decorative elements */}
          <motion.div
            className="absolute top-4 right-4 opacity-70"
            animate={isHovered ? { 
              rotate: [0, 180, 360],
              scale: [1, 1.2, 1]
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-5 h-5 text-white/60" />
          </motion.div>

          <motion.div
            className="absolute top-4 left-4 opacity-50"
            animate={isHovered ? { 
              y: [0, -10, 0],
              opacity: [0.5, 0.8, 0.5]
            } : {}}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            <TrendingUp className="w-4 h-4 text-white" />
          </motion.div>

          {/* Content container with glassmorphism */}
          <div className="absolute inset-0 flex flex-col justify-between p-6">
            {/* Top badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="self-start"
            >
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-medium">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span>Popular</span>
              </div>
            </motion.div>

            {/* Bottom content */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {/* Category title with enhanced typography */}
              <div className="space-y-2">
                <motion.h3 
                  className="text-white text-2xl lg:text-3xl font-bold tracking-tight"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                    {t(name.toLowerCase())}
                  </span>
                </motion.h3>
                
                <p className="text-white/80 text-sm font-medium">
                  Discover premium collection
                </p>
              </div>

              {/* Action button with sophisticated styling */}
              <motion.div
                className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 text-white hover:bg-white/20 transition-colors duration-300">
                  <span className="text-sm font-semibold">Explore</span>
                  <motion.div
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Hover overlay with premium effects */}
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)",
              transform: "translateX(-100%)",
            }}
            animate={isHovered ? { transform: "translateX(100%)" } : {}}
            transition={{ duration: 1, ease: "easeInOut" }}
          />

          {/* Subtle pattern overlay */}
          <div 
            className="absolute inset-0 opacity-10 mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>
      </Link>

      {/* Bottom glow effect */}
      <motion.div
        className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3/4 h-4 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"
        animate={isHovered ? { 
          scale: [1, 1.1, 1],
          opacity: [0, 0.6, 0]
        } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.div>
  )
}