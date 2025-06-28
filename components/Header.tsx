"use client"
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import {
  ShoppingCart,
  User,
  Search,
  Menu,
  X,
  ChevronDown,
  Heart,
  Globe,
  Sun,
  Moon,
  Sparkles,
  TrendingUp,
  Gift,
  Star,
  Bell,
  LogOut,
  Settings,
  Package,
  CreditCard,
  Zap,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { useCart } from '../contexts/CartContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useTheme } from '../contexts/ThemeContext'
import { translations, TranslationKey } from '../utils/translations'
import MiniCart from './MiniCart'
import { useRouter } from 'next/navigation'
import { Product } from '../types'
import { useFavorites } from '../contexts/FavoritesContext'
import { fetchCategories } from '@/lib/api'

// Enhanced search suggestion component
const SearchSuggestion = ({ product, onClick }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    whileHover={{ scale: 1.02, backgroundColor: "rgba(59, 130, 246, 0.05)" }}
    onClick={onClick}
    className="flex items-center gap-3 p-3 cursor-pointer rounded-xl transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20"
  >
    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg flex items-center justify-center">
      <Search className="w-4 h-4 text-blue-600 dark:text-blue-400" />
    </div>
    <div className="flex-1">
      <p className="font-medium text-gray-900 dark:text-white text-sm">{product.name}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{product.description}</p>
    </div>
    <ArrowRight className="w-4 h-4 text-gray-400" />
  </motion.div>
)

// Notification badge component
const NotificationBadge = ({ count, color = "bg-blue-500" }) => {
  if (count === 0) return null

  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`absolute -top-2 -right-2 ${color} text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center font-bold shadow-lg`}
    >
      {count > 99 ? '99+' : count}
    </motion.span>
  )
}

export default function Header() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [notifications] = useState(3) // Mock notifications
  const headerRef = useRef(null)

  const { cart } = useCart()
  const { language, setLanguage } = useLanguage()
  const { theme, setTheme } = useTheme()
  const { favorites } = useFavorites()
  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0)
  const router = useRouter()
  const [isSignedIn, setIsSignedIn] = useState(false)

  // Scroll-based header styling
  const { scrollY } = useScroll()
  const headerOpacity = useTransform(scrollY, [0, 100], [0.95, 1])
  const headerBlur = useTransform(scrollY, [0, 100], [10, 20])

  useEffect(() => {
    const signInData = localStorage.getItem('authToken')
    let signedIn = false

    if (signInData) {

      console.log("User signed in with token:", signInData)
      // Here you would typically decode the token and check user details
      // For simplicity, we assume the user is signed in if token exists
      signedIn = true
    }
    console.log("User signed in status:", localStorage.getItem('authToken'))

    console.log("User signed in status:", signedIn)
    setIsSignedIn(signedIn)
  }, [])

  const handleSignOut = () => {
    localStorage.removeItem('authToken')
    setIsSignedIn(false)
    router.refresh()
  }

  const t = (key: TranslationKey) => translations[language][key]

  // Mock products for search (replace with actual API call)
  const dummyProducts = [
    { id: '1', name: 'Premium Headphones', description: 'High-quality wireless headphones' },
    { id: '2', name: 'Smart Watch', description: 'Latest smartwatch with health tracking' },
    { id: '3', name: 'Gaming Laptop', description: 'High-performance gaming laptop' },
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchCategories()
        const categoriesData = data.map((cat: { _id: string; name: string }) => ({
          _id: cat._id,
          name: cat.name,
        }))
        setCategories(categoriesData)
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (searchQuery.length > 2) {
      const filtered = dummyProducts.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
      setSearchResults(filtered)
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en')
  }

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  const quickActions = [
    { icon: Package, label: 'Orders', href: '/orders', color: 'text-blue-500' },
    { icon: Heart, label: 'Wishlist', href: '/favorites', color: 'text-red-500' },
    { icon: CreditCard, label: 'Payment', href: '/payment', color: 'text-green-500' },
    { icon: Settings, label: 'Settings', href: '/settings', color: 'text-purple-500' },
  ]

  return (
    <>
      {/* Header */}
      <motion.header
        ref={headerRef}
        style={{
          opacity: headerOpacity,
          backdropFilter: `blur(${headerBlur}px)`
        }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg shadow-black/5 dark:shadow-black/20"
      >
        <div className="container mx-auto px-6">
          {/* Top notification bar */}
          {/* <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="hidden md:flex items-center justify-center py-2 text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-b-xl mx-4"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Free shipping on orders over د.ع50 • Limited time offer!
            <Gift className="w-4 h-4 ml-2" />
          </motion.div> */}

          {/* Main header */}
          <div className="py-4 flex items-center justify-between">
            {/* Left section - Logo & Mobile menu */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>

              <Link href="/" className="flex items-center group">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Oro Eshop
                  </span>
                </motion.div>
              </Link>
            </div>

            {/* Center section - Navigation (Desktop) */}
            <nav className="hidden lg:flex items-center gap-8">
              {[
                { href: '/products', label: t('products'), icon: Package },
                { href: '/deals', label: t('deals'), icon: TrendingUp },
                { href: '/new-arrivals', label: t('newArrivals'), icon: Star },
              ].map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={item.href}
                    className="flex items-center gap-2 px-4 py-2 rounded-2xl font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300"
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              {/* Categories Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 px-4 py-2 rounded-2xl font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    <Menu className="w-4 h-4" />
                    {t('categories')}
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="center"
                  className={`w-[600px] bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-xl p-6 ${language === 'ar' ? 'text-right' : 'text-left'}`}
                  dir={language === 'ar' ? 'rtl' : 'ltr'}
                >
                  <DropdownMenuLabel className="text-center font-semibold text-lg mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {language === 'ar' ? 'تصفح الفئات' : 'Browse Categories'}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="mb-6" />

                  {/* Multi-column Grid Layout */}
                  <div className="grid grid-cols-3 gap-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                    {categories.map((category, index) => (
                      <motion.div
                        key={category._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                      >
                        <DropdownMenuItem className="rounded-xl p-0 border-0 focus:bg-transparent">
                          <Link
                            href={`/categories/${category._id}`}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 group ${language === 'ar' ? 'flex-row-reverse text-right' : ''}`}
                          >
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center group-hover:from-blue-200 group-hover:to-purple-200 dark:group-hover:from-blue-800/40 dark:group-hover:to-purple-800/40 transition-all duration-200">
                              <div className="w-3 h-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full"></div>
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-relaxed">
                              {category.name}
                            </span>
                          </Link>
                        </DropdownMenuItem>
                      </motion.div>
                    ))}
                  </div>

                  {/* View All Categories Link */}
                  {categories.length > 12 && (
                    <div className="mt-6 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                      <Link
                        href="/categories"
                        className={`flex items-center justify-center gap-2 w-full py-3 px-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-800/30 dark:hover:to-purple-800/30 rounded-xl transition-all duration-200 group ${language === 'ar' ? 'flex-row-reverse' : ''}`}
                      >
                        <span className="font-medium text-blue-600 dark:text-blue-400">
                          {language === 'ar' ? 'عرض جميع الفئات' : 'View All Categories'}
                        </span>
                        <ArrowRight className={`w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform ${language === 'ar' ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                      </Link>
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>

            {/* Right section - Actions */}
            <div className="flex items-center gap-2">
              {/* Enhanced Search */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 relative"
                >
                  <Search className="h-5 w-5" />
                </Button>

                <AnimatePresence>
                  {isSearchOpen && (
                    <>
                      {/* Backdrop */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSearchOpen(false)}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                      />

                      {/* Search Panel */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute top-full right-0 mt-4 w-96 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 z-50 overflow-hidden"
                      >
                        <div className="p-6">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              type="text"
                              placeholder={`${t('search')} products...`}
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full pl-10 pr-4 h-12 bg-gray-50/80 dark:bg-gray-700/80 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-blue-500/20"
                              autoFocus
                            />
                          </div>

                          {/* Search Results */}
                          {searchResults.length > 0 && (
                            <div className="mt-4 space-y-1">
                              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 px-2">Suggestions</p>
                              {searchResults.map((product) => (
                                <SearchSuggestion
                                  key={product.id}
                                  product={product}
                                  onClick={() => {
                                    router.push(`/products/${product.id}`)
                                    setIsSearchOpen(false)
                                    setSearchQuery('')
                                  }}
                                />
                              ))}
                            </div>
                          )}

                          {/* Quick Actions */}
                          <div className="mt-6 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Quick Actions</p>
                            <div className="grid grid-cols-2 gap-2">
                              {quickActions.map((action) => (
                                <Link
                                  key={action.href}
                                  href={action.href}
                                  onClick={() => setIsSearchOpen(false)}
                                  className="flex items-center gap-2 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                >
                                  <action.icon className={`w-4 h-4 ${action.color}`} />
                                  <span className="text-sm font-medium">{action.label}</span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Language Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguage}
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Globe className="h-4 w-4" />
                <span className="font-medium">{language === 'en' ? 'العربية' : 'English'}</span>
              </Button>

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <motion.div
                  animate={{ rotate: theme === 'dark' ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </motion.div>
              </Button>

              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                className="rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 relative"
              >
                <Bell className="h-5 w-5" />
                <NotificationBadge count={notifications} color="bg-red-500" />
              </Button>

              {/* Favorites */}
              <Link href="/favorites">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 relative"
                >
                  <Heart className={`h-5 w-5 ${favorites.length > 0 ? 'text-red-500 fill-red-500' : ''}`} />
                  <NotificationBadge count={favorites.length} color="bg-red-500" />
                </Button>
              </Link>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-xl"
                >
                  {isSignedIn ? (
                    <>
                      <DropdownMenuLabel className="text-center">
                        <div className="flex flex-col items-center py-2">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-2">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <span className="font-semibold">Welcome back!</span>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="rounded-xl mx-1">
                        <Link href="/profile" className="w-full flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {t('profile')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="rounded-xl mx-1">
                        <Link href="/orders" className="w-full flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          My Orders
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="rounded-xl mx-1">
                        <Link href="/settings" className="w-full flex items-center gap-2">
                          <Settings className="w-4 h-4" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={handleSignOut} className="rounded-xl mx-1 text-red-600 dark:text-red-400">
                        <LogOut className="w-4 h-4 mr-2" />
                        {t('signOut')}
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuLabel className="text-center py-4">
                        <Zap className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                        <span className="font-semibold">Join Oro Eshop</span>
                      </DropdownMenuLabel>
                      <DropdownMenuItem className="rounded-xl mx-1">
                        <Link href="/signin" className="w-full text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-xl font-medium">
                          {t('signIn')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="rounded-xl mx-1">
                        <Link href="/signup" className="w-full text-center py-2">
                          Create Account
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Enhanced Cart */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsCartOpen(!isCartOpen)}
                  className="rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 relative"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <NotificationBadge count={cartItemsCount} color="bg-green-500" />
                </Button>

                <AnimatePresence>
                  {isCartOpen && (
                    <>
                      {/* Backdrop */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsCartOpen(false)}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                      />

                      {/* Cart Panel */}
                      <motion.div
                        initial={{ opacity: 0, x: 20, y: -10 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        exit={{ opacity: 0, x: 20, y: -10 }}
                        className={`absolute mt-4 z-50 ${language === "en" ? "right-0" : "left-0"}`}
                      >
                        <MiniCart onClose={() => setIsCartOpen(false)} />
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Enhanced Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: language === 'en' ? '-100%' : '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: language === 'en' ? '-100%' : '100%', opacity: 0 }}
              className={`fixed top-0 ${language === 'en' ? 'left-0' : 'right-0'} bottom-0 w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl z-50 border-r dark:border-gray-700 shadow-2xl`}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg font-bold">Menu</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-2xl"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Navigation */}
              <nav className="p-6">
                <div className="space-y-2">
                  {[
                    { href: '/products', label: t('products'), icon: Package },
                    { href: '/categories/getall', label: t('categories'), icon: Menu },
                    { href: '/deals', label: t('deals'), icon: TrendingUp },
                    { href: '/new-arrivals', label: t('newArrivals'), icon: Star },
                    { href: '/profile', label: t('profile'), icon: User },
                    { href: '/favorites', label: 'Favorites', icon: Heart },
                  ].map((item, index) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 p-4 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 group"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                          <item.icon className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                        </div>
                        <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {item.label}
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Settings */}
                <div className="mt-8 pt-6 border-t border-gray-200/50 dark:border-gray-700/50 space-y-2">
                  <Button
                    variant="ghost"
                    onClick={toggleLanguage}
                    className="w-full justify-start rounded-2xl h-14 px-4"
                  >
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center mr-3">
                      <Globe className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <span className="font-medium">
                      {language === 'en' ? 'العربية' : 'English'}
                    </span>
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={toggleTheme}
                    className="w-full justify-start rounded-2xl h-14 px-4"
                  >
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center mr-3">
                      {theme === 'light' ?
                        <Moon className="h-5 w-5 text-gray-600 dark:text-gray-400" /> :
                        <Sun className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      }
                    </div>
                    <span className="font-medium">
                      {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                    </span>
                  </Button>
                </div>

                {/* Auth Actions */}
                <div className="mt-8 space-y-3">
                  {!isSignedIn ? (
                    <>
                      <Link
                        href="/signin"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block w-full"
                      >
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl h-12 font-medium">
                          {t('signIn')}
                        </Button>
                      </Link>
                      <Link
                        href="/signup"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block w-full"
                      >
                        <Button variant="outline" className="w-full rounded-2xl h-12 font-medium">
                          Create Account
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <Button
                      onClick={handleSignOut}
                      variant="outline"
                      className="w-full rounded-2xl h-12 font-medium text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {t('signOut')}
                    </Button>
                  )}
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer to prevent content from going under fixed header */}
      <div className="h-24"></div>
    </>
  )
}