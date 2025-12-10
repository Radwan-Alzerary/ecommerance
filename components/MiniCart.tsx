'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { X, Minus, Plus, ShoppingBag, Trash2, ArrowRight, Sparkles, Gift, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '../contexts/CartContext'
import { useLanguage } from '../contexts/LanguageContext'
import { translations, TranslationKey } from '../utils/translations'
import { CartItem } from '../types'
import { buildAssetUrl } from '@/lib/apiUrl'
import { useState } from 'react'

interface MiniCartProps {
  onClose?: () => void
}

// Enhanced cart item component
const CartItemComponent = ({ item, onUpdateQuantity, onRemove, language, t }) => {
  const [isRemoving, setIsRemoving] = useState(false)

  const handleRemove = () => {
    setIsRemoving(true)
    setTimeout(() => {
      onRemove(item._id)
    }, 300)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ 
        opacity: isRemoving ? 0 : 1, 
        x: isRemoving ? -100 : 0,
        scale: isRemoving ? 0.8 : 1
      }}
      exit={{ opacity: 0, x: -100, scale: 0.8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group relative"
    >
      <div className="flex gap-4 p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all duration-300 hover:shadow-lg">
        {/* Product Image */}
        <div className="relative w-20 h-20 rounded-xl overflow-hidden group-hover:scale-105 transition-transform duration-300">
          {item.image?.url ? (
            <>
              <Image
                src={buildAssetUrl(item.image.url)}
                alt={item.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 via-zinc-100 to-gray-100 dark:from-slate-900 dark:via-zinc-900 dark:to-gray-900 overflow-hidden">
              <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.08]" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 0.5px, transparent 0)',
                backgroundSize: '16px 16px'
              }}></div>
              
              <div className="relative bg-white/70 dark:bg-slate-800/70 backdrop-blur-md p-3 rounded-lg border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
                <svg 
                  className="w-7 h-7 text-slate-400 dark:text-slate-600" 
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
              </div>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <Link 
            href={`/products/${item.id || item._id}`} 
            className="block font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 line-clamp-2 text-sm leading-tight mb-1"
          >
            {item.name}
          </Link>
          
          {/* Product Options */}
          {(item.selectedColor || item.selectedSize) && (
            <div className="flex flex-wrap gap-2 mb-2">
              {item.selectedColor && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs font-medium">
                  <div 
                    className="w-2 h-2 rounded-full border border-white shadow-sm"
                    style={{ backgroundColor: item.selectedColor.toLowerCase() }}
                  />
                  {item.selectedColor}
                </span>
              )}
              {item.selectedSize && (
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs font-medium">
                  {t('size')}: {item.selectedSize}
                </span>
              )}
            </div>
          )}

          {/* Quantity Controls and Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-xl">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-l-xl hover:bg-gray-200 dark:hover:bg-gray-600"
                onClick={() => onUpdateQuantity(item._id, item.quantity - 1)}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-r-xl hover:bg-gray-200 dark:hover:bg-gray-600"
                onClick={() => onUpdateQuantity(item._id, item.quantity + 1)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            <div className="text-right">
              <div className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                د.ع{(item.price * item.quantity).toLocaleString('en-US', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Remove Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRemove}
          className="absolute -top-2 -right-2 h-6 w-6 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-full border border-red-200 dark:border-red-800 opacity-0 group-hover:opacity-100 transition-all duration-200"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </motion.div>
  )
}

// Enhanced empty cart component
const EmptyCart = ({ onClose, t, language }: { onClose: any; t: any; language: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center justify-center py-12 px-6"
  >
    <motion.div
      animate={{ 
        y: [0, -10, 0],
        rotate: [0, 5, -5, 0]
      }}
      transition={{ 
        duration: 3, 
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-3xl flex items-center justify-center mb-6 shadow-lg"
    >
      <ShoppingBag className="w-10 h-10 text-blue-600 dark:text-blue-400" />
    </motion.div>
    
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
      {language === 'ar' ? 'سلتك فارغة' : 'Your cart is empty'}
    </h3>
    <p className="text-gray-600 dark:text-gray-400 text-center mb-6 text-sm leading-relaxed">
      {language === 'ar' 
        ? 'ابدأ بإضافة بعض المنتجات الرائعة إلى سلتك'
        : 'Start adding some amazing products to your cart'
      }
    </p>
    
    <div className="space-y-3 w-full">
      <Button 
        onClick={onClose}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl h-12 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        {t('continueShopping')}
      </Button>
      
      <Button 
        variant="outline" 
        className="w-full rounded-2xl h-10 font-medium"
        asChild
      >
        <Link href="/deals">
          <Gift className="w-4 h-4 mr-2" />
          {language === 'ar' ? 'تصفح العروض' : 'Browse Deals'}
        </Link>
      </Button>
    </div>
  </motion.div>
)

export default function MiniCart({ onClose }: MiniCartProps) {
  const { cart, removeFromCart, updateQuantity } = useCart()
  const { language } = useLanguage()
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const [isClosing, setIsClosing] = useState(false)

  const t = (key: TranslationKey) => translations[language][key]

  const handleClose = () => {
    if (onClose) {
      setIsClosing(true)
      setTimeout(() => {
        onClose()
      }, 200)
    }
  }

  // Calculate savings (mock discount)
  const originalTotal = total * 1.15
  const savings = originalTotal - total

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ 
        opacity: isClosing ? 0 : 1, 
        scale: isClosing ? 0.95 : 1,
        y: isClosing ? -10 : 0
      }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="w-[420px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
    >
      {/* Header */}
      <div className="relative p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {t('cart')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {cart.length} {language === 'ar' ? 'عنصر' : 'items'}
              </p>
            </div>
          </div>
          {onClose && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleClose}
              className="rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
        
        {/* Floating decorative elements */}
        <div className="absolute top-2 right-16 opacity-30">
          <Sparkles className="w-4 h-4 text-purple-500" />
        </div>
        <div className="absolute bottom-2 left-16 opacity-20">
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
        </div>
      </div>

      {/* Cart Content */}
      {cart.length === 0 ? (
        <EmptyCart onClose={handleClose} t={t} language={language} />
      ) : (
        <>
          {/* Cart Items */}
          <div className="max-h-96 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
            <AnimatePresence mode="popLayout">
              {cart.map((item: CartItem) => (
                <CartItemComponent
                  key={item._id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeFromCart}
                  language={language}
                  t={t}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Summary Section */}
          <div className="p-6 bg-gray-50/80 dark:bg-gray-800/50 backdrop-blur-sm border-t border-gray-200/50 dark:border-gray-700/50">
            {/* Savings Banner */}
            {savings > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-2xl"
              >
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                    {language === 'ar' 
                      ? `وفرت د.ع${savings.toLocaleString()}`
                      : `You saved د.ع${savings.toLocaleString()}`
                    }
                  </span>
                </div>
              </motion.div>
            )}

            {/* Total */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 font-medium">
                  {language === 'ar' ? 'المجموع الفرعي:' : 'Subtotal:'}
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  د.ع{total.toLocaleString('en-US', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  })}
                </span>
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {t('total')}:
                </span>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  د.ع{total.toLocaleString('en-US', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  })}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl h-12 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group" 
                asChild
              >
                <Link href="/checkout">
                  <CreditCard className="w-4 h-4 mr-2" />
                  {t('checkout')}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full rounded-2xl h-10 font-medium bg-white/80 dark:bg-gray-800/80 hover:bg-gray-50 dark:hover:bg-gray-700" 
                onClick={handleClose}
              >
                {t('continueShopping')}
              </Button>
            </div>

            {/* Free Shipping Banner */}
            {total < 50000 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl"
              >
                <div className="text-center">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {language === 'ar' 
                      ? `أضف د.ع${(50000 - total).toLocaleString()} للحصول على شحن مجاني`
                      : `Add د.ع${(50000 - total).toLocaleString()} for free shipping`
                    }
                  </p>
                  <div className="mt-2 w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((total / 50000) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </>
      )}
    </motion.div>
  )
}