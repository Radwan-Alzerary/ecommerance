'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { X, Minus, Plus, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '../contexts/CartContext'
import { useLanguage } from '../contexts/LanguageContext'
import { translations, TranslationKey } from '../utils/translations'
import { CartItem } from '../types'
import { API_URL } from '@/lib/apiUrl'

interface MiniCartProps {
  onClose?: () => void
}

export default function MiniCart({ onClose }: MiniCartProps) {
  const { cart, removeFromCart, updateQuantity } = useCart()
  const { language } = useLanguage()
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const t = (key: TranslationKey) => translations[language][key]

  if (cart.length === 0) {
    return (
      <div className="w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 p-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <ShoppingBag className="w-12 h-12 text-gray-400 dark:text-gray-500" />
          <p className="text-gray-600 dark:text-gray-400">{t('cart')} is empty</p>
          <Button onClick={onClose}>{t('continueShopping')}</Button>
        </div>
      </div>
    )
  }
console.log(cart)
  return (
    <div className="w-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border dark:border-gray-700">
      <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-semibold">{t('cart')} ({cart.length})</h3>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="max-h-96 overflow-auto">
        {cart.map((item: CartItem) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex p-4 border-b dark:border-gray-700"
          >
            <div className="relative w-20 h-20 rounded-lg overflow-hidden">
              <Image
                src={API_URL + item.image?.url}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="ml-4 flex-1">
              <Link href={`/products/${item.id}`} className="font-medium hover:text-blue-600 dark:hover:text-blue-400">
                {item.name}
              </Link>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {item.selectedColor && `${t('color')}: ${item.selectedColor}`}
                {item.selectedSize && `, ${t('size')}: ${item.selectedSize}`}
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <div className="text-right">
                  <div className="font-medium">${(item.price * item.quantity).toFixed(2)}</div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    {/* {t('remove')} */}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="p-4 border-t dark:border-gray-700">
        <div className="flex justify-between mb-4">
          <span className="font-medium">{t('total')}</span>
          <span className="font-bold">${total.toFixed(2)}</span>
        </div>
        <div className="space-y-2">
          <Button className="w-full" asChild>
            <Link href="/checkout">{t('checkout')}</Link>
          </Button>
          <Button variant="outline" className="w-full" onClick={onClose}>
            {t('continueShopping')}
          </Button>
        </div>
      </div>
    </div>
  )
}

