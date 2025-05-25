'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/CartContext'
import { useFavorites } from '@/contexts/FavoritesContext'
import { Star, StarHalf, ShoppingCart, Eye, Heart } from 'lucide-react'
import { Product } from '@/types'
import { useLanguage } from '@/contexts/LanguageContext'
import { translations } from '@/utils/translations'
import { API_URL } from '@/lib/apiUrl'

interface ProductCardProps extends Product { }

export default function ProductCard({
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
}: ProductCardProps) {
  const { addToCart } = useCart()
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites()
  const { language } = useLanguage()

  const t = (key: keyof typeof translations.en) => translations[language][key]
  const isFav = isFavorite(_id)

  const toggleFav = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isFav) {
      removeFromFavorites(_id)
    } else {
      addToFavorites({
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
      })
    }
  }

  const renderStars = (score?: number) => {
    if (score === undefined) return null
    const full = Math.floor(score)
    const half = score % 1 !== 0
    return (
      <>
        {Array.from({ length: full }).map((_, i) => (
          <Star
            key={i}
            className="h-4 w-4 text-yellow-400 fill-yellow-400 drop-shadow"
          />
        ))}
        {half && (
          <StarHalf className="h-4 w-4 text-yellow-400 fill-yellow-400 drop-shadow" />
        )}
      </>
    )
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="group relative flex  flex-col overflow-hidden rounded-2xl bg-white/90 ring-1 ring-gray-200 shadow-md dark:bg-gray-800/60 dark:ring-white/10"
    >
      {/* ─── Thumbnail ─────────────────────────────────────────────── */}
      <Link
        href={`/products/${_id}`}
        className="relative block aspect-square overflow-hidden"
      >
        <Image
          src={API_URL + image?.url}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          priority
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Rating badge */}
        {rating !== undefined && (
          <span className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-white/85 px-2 py-0.5 text-xs font-medium text-gray-900 backdrop-blur">
            {rating}
            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
          </span>
        )}

        {/* Action icons (appear on hover) */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          {/* Add to cart */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 bg-white/90 backdrop-blur hover:bg-white"
            onClick={(e) => {
              e.preventDefault()
              addToCart({
                _id,
                id,
                name,
                price,
                quantity: 1,
                image,
                category,
                colors,
                sizes,
                description,
                rating,
              })
            }}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>

          {/* Favourite */}
          <Button
            variant="ghost"
            size="icon"
            className={`h-9 w-9 backdrop-blur ${isFav
                ? 'bg-red-50 hover:bg-red-100 text-red-600'
                : 'bg-white/90 hover:bg-white'
              }`}
            onClick={toggleFav}
          >
            <Heart
              className={`h-4 w-4 ${isFav ? 'fill-red-500 text-red-500' : ''}`}
            />
          </Button>
        </div>
      </Link>

      {/* ─── Info section ──────────────────────────────────────────── */}
      <div className="flex grow flex-col p-4">
        <Link href={`/products/${_id}`} className="block mb-1 h-12 overflow-hidden">
          <p className="mb-1 text-xs text-muted-foreground">{category?.name}</p>
          <h3 className="line-clamp-2 text-base font-semibold text-gray-900 dark:text-white transition-colors duration-300 group-hover:text-primary">
            {name}
          </h3>
        </Link>

        <div className="mb-2 flex items-center">{renderStars(rating)}</div>

        <div className="mt-auto flex flex-col gap-3">
          {/* Price */}
          <p className="text-xl font-bold text-primary dark:text-blue-400">
            د.ع {price?.toLocaleString()}
          </p>

          {/* Color dots & quick view */}
          <div className="flex justify-between items-center">
            {/* Color swatches */}
            <div className="flex space-x-1">
              {colors?.slice(0, 3).map((c) => (
                <span
                  key={c}
                  className="h-4 w-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: c.toLowerCase() }}
                  title={c}
                />
              ))}
              {colors && colors.length > 3 && (
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-200 text-[10px] text-gray-600">
                  +{colors.length - 3}
                </div>
              )}
            </div>

            {/* Quick view */}
            {/* <Link href={`/products/${_id}`}>
              <Button variant="outline" size="sm" className="text-xs">
                <Eye className="mr-1 h-3 w-3" />
                {t('view')}
              </Button>
            </Link> */}
          </div>
        </div>
      </div>
    </motion.article>
  )
}
