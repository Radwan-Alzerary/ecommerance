"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, User, Search, Menu, X, ChevronDown, Heart, Globe, Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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

export default function Header() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const { cart } = useCart()
  const { language, setLanguage } = useLanguage()
  const { theme, setTheme } = useTheme()
  const { favorites } = useFavorites()
  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0)
  const router = useRouter()
  const [isSignedIn, setIsSignedIn] = useState(false)

  useEffect(() => {
    const signedIn = localStorage.getItem('isSignedIn') === 'true'
    setIsSignedIn(signedIn)
  }, [])

  const handleSignOut = () => {
    localStorage.removeItem('isSignedIn')
    setIsSignedIn(false)
    router.refresh()
  }

  const t = (key: TranslationKey) => translations[language][key]

  // Fetch categories from the API instead of using dummy data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchCategories();
        // Map data to get both id and name.
        const categoriesData = data.map((cat: { _id: string; name: string }) => ({
          _id: cat._id,
          name: cat.name,
        }));
        setCategories(categoriesData);
        console.log(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (searchQuery.length > 2) {
      // Filter dummy products for search suggestions
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

  return (
    <header className="sticky top-0 bg-white dark:bg-gray-800 shadow-md z-50">
      <div className="container mx-auto px-4">

        {/* Main header */}
        <div className="py-4 flex items-center justify-between">
          <div className="flex items-end w-1/3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden ml-2"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold">Oro Eshop</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center justify-center gap-8 w-1/3 ">
            <Link href="/products" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
              {t('products')}
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
                {t('categories')} <ChevronDown className="mr-1 h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {categories.map((category) => (
                  <DropdownMenuItem key={category._id}>
                    <Link href={`/categories/${category._id}`} className="w-full">
                      {category.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/deals" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
              {t('deals')}
            </Link>
            <Link href="/new-arrivals" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
              {t('newArrivals')}
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center w-1/3 justify-end">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              >
                <Search className="h-5 w-5" />
              </Button>
              <AnimatePresence>
                {isSearchOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 p-4"
                  >
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder={t('search')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full"
                      />
                      {searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 mt-2 rounded-lg shadow-lg border dark:border-gray-700">
                          {searchResults.map((product) => (
                            <Link
                              key={product.id}
                              href={`/products/${product.id}`}
                              className="block p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                              onClick={() => {
                                setIsSearchOpen(false)
                                setSearchQuery('')
                              }}
                            >
                              {product.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Button variant="ghost" size="sm" onClick={toggleLanguage}>
              <Globe className="h-4 w-4 ml-2" />
              {language === 'en' ? 'العربية' : 'English'}
            </Button>
            <Button variant="ghost" size="sm" onClick={toggleTheme}>
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>

            <Link href="/favorites">
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="h-5 w-5" />
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Link href="/profile" className="w-full">{t('profile')}</Link>
                </DropdownMenuItem>
                {isSignedIn ? (
                  <DropdownMenuItem onSelect={handleSignOut}>{t('signOut')}</DropdownMenuItem>
                ) : (
                  <Link href="/signin">{t('signIn')}</Link>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCartOpen(!isCartOpen)}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </Button>
              <AnimatePresence>
                {isCartOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className={`absolute mt-2 z-50 ${language === "en" ? "right-0" : "left-0"
                      }`}
                  >
                    <MiniCart onClose={() => setIsCartOpen(false)} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: language === 'en' ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: language === 'en' ? '-100%' : '100%' }}
            className="fixed inset-0 bg-white dark:bg-gray-800 z-50"
          >
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
              <span className="text-xl font-bold">{t('categories')}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            <nav className="p-4">
              <div className="space-y-4">
                <Link
                  href="/products"
                  className="block text-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('products')}
                </Link>
                <Link
                  href="/categories/getall"
                  className="block text-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('categories')}
                </Link>
                <Link
                  href="/deals"
                  className="block text-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('deals')}
                </Link>
                <Link
                  href="/new-arrivals"
                  className="block text-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('newArrivals')}
                </Link>
                <Link
                  href="/profile"
                  className="block text-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('profile')}
                </Link>
                <Link
                  href="/signin"
                  className="block text-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('signIn')}
                </Link>
                <Link
                  href="/signup"
                  className="block text-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('signUp')}
                </Link>
                <Button variant="ghost" onClick={toggleLanguage} className="w-full justify-start">
                  <Globe className="h-4 w-4 ml-2" />
                  {language === 'en' ? 'العربية' : 'English'}
                </Button>
                <Button variant="ghost" onClick={toggleTheme} className="w-full justify-start">
                  {theme === 'light' ? <Moon className="h-4 w-4 ml-2" /> : <Sun className="h-4 w-4 ml-2" />}
                  {theme === 'light' ? t('darkMode') : t('lightMode')}
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
