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

interface ProductCardProps extends Product {}

export default function ProductCard({_id, id, name, price, image, rating, category, colors, sizes, description }: ProductCardProps) {
  const { addToCart } = useCart()
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites()
  const { language } = useLanguage()
  const t = (key: keyof typeof translations.en) => translations[language][key]
  const isProductFavorite = isFavorite(_id)
  // console.log(category)
  const handleFavoriteClick = () => {
    if (isProductFavorite) {
      removeFromFavorites(_id)
    } else {
      addToFavorites({_id, id, name, price, image, rating, category, colors, sizes, description })
    }
  }

  const renderStars = (rating: number | undefined) => {
    if (rating === undefined) return null;
    
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }

    return stars;
  };

  return (
    <motion.div 
      className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl h-[420px] flex flex-col"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        <Link href={`/products/${_id}`}>
          <div className="relative h-48 overflow-hidden">
            <Image src={API_URL +  image?.url} alt={name} fill className="object-cover transition-transform duration-300 hover:scale-105" />
          </div>
        </Link>
        <div className="absolute top-2 right-2 flex gap-2">
          <Button
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
            onClick={() => addToCart({_id, id, name, price, quantity: 1, image, category, colors, sizes, description, rating })}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-8 w-8 p-0 ${isProductFavorite ? 'bg-red-50 hover:bg-red-100' : 'bg-white/80 hover:bg-white'}`}
            onClick={handleFavoriteClick}
          >
            <Heart className={`h-4 w-4 ${isProductFavorite ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <Link href={`/products/${_id}`} className="block mb-2 h-12 overflow-hidden">
          <h3 className="text-lg font-semibold hover:text-blue-600 transition-colors duration-300 line-clamp-2">{name}</h3>
        </Link>
        <p className="text-sm text-gray-600 mb-2">{category?.name}</p>
        <div className="flex items-center mb-2">
          {renderStars(rating)}
          {/* <span className="ml-2 text-sm text-gray-600">
            {rating !== undefined ? `(${rating})` : '(No rating)'}
          </span> */}
        </div>
        <div className="mt-auto">
          <p className="text-blue-600 dark:text-blue-400 font-semibold text-lg mb-4">
            د.ع{price?.toLocaleString()}
          </p>
          <div className="flex justify-between items-center">
            <div className="flex space-x-1">
              {colors && colors.slice(0, 3).map((color) => (
                <div
                  key={color}
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: color.toLowerCase() }}
                  title={color}
                ></div>
              ))}
              {colors && colors.length > 3 && (
                <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600">
                  +{colors.length - 3}
                </div>
              )}
            </div>
            <Link href={`/products/${_id}`}>
              <Button variant="outline" size="sm" className="text-xs">
                <Eye className="h-3 w-3 mr-1" /> {t('view')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

