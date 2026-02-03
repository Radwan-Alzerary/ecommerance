'use client'

import { useState, useEffect, useMemo, useRef, useDeferredValue } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useIsDesktop from '@/utils/useIsDesktop'

import ProductCard from './ProductCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Product } from '../types'
import { 
  Search, 
  Filter, 
  X, 
  Grid3x3, 
  List, 
  SortAsc, 
  SortDesc,
  Star,
  ShoppingBag,
  Palette,
  Ruler,
  Tag,
  RefreshCw,
  TrendingUp,
  Eye,
  EyeOff
} from 'lucide-react'

interface ProductGridProps {
  products: Product[]
  useServerPagination?: boolean
  serverPagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  onPageChange?: (page: number) => void
  onPageSizeChange?: (limit: number) => void
  filters?: {
    searchTerm?: string
    sortBy?: SortOption
    priceRange?: [number, number]
    selectedCategories?: string[]
    selectedColors?: string[]
    selectedSizes?: string[]
    minRating?: number
  }
  onFiltersChange?: (filters: {
    searchTerm: string
    sortBy: SortOption
    priceRange: [number, number]
    selectedCategories: string[]
    selectedColors: string[]
    selectedSizes: string[]
    minRating: number
  }) => void
}

type SortOption = 'name' | 'price-low' | 'price-high' | 'rating' | 'newest'
type ViewMode = 'grid' | 'list'

type DualRangeSliderProps = {
  min: number
  max: number
  value: [number, number]
  onChange: (value: [number, number]) => void
  step?: number
}

// Custom Dual Range Slider Component
const DualRangeSlider = ({ min, max, value, onChange, step = 1 }: DualRangeSliderProps) => {
  const sliderRef = useRef<HTMLDivElement | null>(null)
  const [isDragging, setIsDragging] = useState<number | null>(null)

  const getPercent = (value: number, min: number, max: number) => Math.round(((value - min) / (max - min)) * 100)

  const handleMouseDown = (index: 0 | 1) => (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(index)
  }

  const handleMouseMove = (event: MouseEvent) => {
    if (isDragging === null || !sliderRef.current) return

    const rect = sliderRef.current.getBoundingClientRect()
    const percent = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100))
    const newValue = Math.round((percent / 100) * (max - min) + min)
    const snappedValue = Math.round(newValue / step) * step

    const newRange: [number, number] = [...value] as [number, number]
    newRange[isDragging] = Math.max(min, Math.min(max, snappedValue))
    
    // Ensure min doesn't exceed max
    if (isDragging === 0 && newRange[0] > newRange[1]) {
      newRange[0] = newRange[1]
    }
    // Ensure max doesn't go below min
    if (isDragging === 1 && newRange[1] < newRange[0]) {
      newRange[1] = newRange[0]
    }

    onChange(newRange)
  }

  const handleMouseUp = () => {
    setIsDragging(null)
  }

  useEffect(() => {
    if (isDragging !== null) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, value, min, max, step])

  const minPercent = getPercent(value[0], min, max)
  const maxPercent = getPercent(value[1], min, max)

  return (
    <div className="relative h-6 flex items-center">
      {/* Track */}
      <div
        ref={sliderRef}
        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full relative cursor-pointer"
      >
        {/* Active range */}
        <div
          className="absolute h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`,
          }}
        />
        
        {/* Min handle */}
        <div
          className="absolute w-5 h-5 bg-white border-2 border-blue-500 rounded-full shadow-lg cursor-grab active:cursor-grabbing transform -translate-y-1/2 -translate-x-1/2 hover:scale-110 transition-transform"
          style={{ left: `${minPercent}%`, top: '50%' }}
          onMouseDown={handleMouseDown(0)}
        />
        
        {/* Max handle */}
        <div
          className="absolute w-5 h-5 bg-white border-2 border-blue-500 rounded-full shadow-lg cursor-grab active:cursor-grabbing transform -translate-y-1/2 -translate-x-1/2 hover:scale-110 transition-transform"
          style={{ left: `${maxPercent}%`, top: '50%' }}
          onMouseDown={handleMouseDown(1)}
        />
      </div>
    </div>
  )
}

export default function ProductGrid({
  products,
  useServerPagination = false,
  serverPagination,
  onPageChange,
  onPageSizeChange,
  filters,
  onFiltersChange
}: ProductGridProps) {
  const getNumericRating = (rating: Product['rating']): number => {
    if (Array.isArray(rating)) {
      if (!rating.length) return 0
      const sum = rating.reduce((acc, r) => acc + (typeof r === 'number' ? r : Number(r) || 0), 0)
      return sum / rating.length
    }
    return typeof rating === 'number' ? rating : Number(rating) || 0
  }
  // Memoized filter options - حساب القيم مقدماً
  const filterOptions = useMemo(() => {
    const categoryNames = products
      .map(product => product.category?.name)
      .filter((n): n is string => Boolean(n))
    const categories = Array.from(new Set(categoryNames))
  const colors = Array.from(new Set(products.flatMap(product => product.colors || [])))
  const sizes = Array.from(new Set(products.flatMap(product => product.sizes || [])))
  const maxPrice = products.length ? Math.max(...products.map(p => Number(p.price) || 0)) : 0

    console.log("📊 ProductGrid - Products received:", products.length);
    console.log("💰 ProductGrid - Max price calculated:", maxPrice);

    return { categories, colors, sizes, maxPrice }
  }, [products])

  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products)
  const [searchTerm, setSearchTerm] = useState(filters?.searchTerm ?? '')
  const deferredSearch = useDeferredValue(searchTerm)
  // تحديث: استخدام maxPrice الفعلي بدلاً من القيمة الثابتة
  const [priceRange, setPriceRange] = useState<[number, number]>(filters?.priceRange ?? [0, filterOptions.maxPrice])
  const [selectedCategories, setSelectedCategories] = useState<string[]>(filters?.selectedCategories ?? [])
  const [selectedColors, setSelectedColors] = useState<string[]>(filters?.selectedColors ?? [])
  const [selectedSizes, setSelectedSizes] = useState<string[]>(filters?.selectedSizes ?? [])
  const [minRating, setMinRating] = useState(filters?.minRating ?? 0)
  const [sortBy, setSortBy] = useState<SortOption>(filters?.sortBy ?? 'newest')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [pageSize, setPageSize] = useState(20)
  const [currentPage, setCurrentPage] = useState(1)
  const isDesktop = useIsDesktop()

  // تحديث نطاق السعر عند تغيير المنتجات
  useEffect(() => {
    setPriceRange([0, filterOptions.maxPrice])
  }, [filterOptions.maxPrice])

  useEffect(() => {
    if (!filters) return
    if (typeof filters.searchTerm === 'string') setSearchTerm(filters.searchTerm)
    if (filters.sortBy) setSortBy(filters.sortBy)
    if (filters.priceRange) setPriceRange(filters.priceRange)
    if (filters.selectedCategories) setSelectedCategories(filters.selectedCategories)
    if (filters.selectedColors) setSelectedColors(filters.selectedColors)
    if (filters.selectedSizes) setSelectedSizes(filters.selectedSizes)
    if (typeof filters.minRating === 'number') setMinRating(filters.minRating)
  }, [filters])

  // Keep filtered products in sync when incoming products change
  useEffect(() => {
    setFilteredProducts(products)
  }, [products])

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (useServerPagination) {
        setFilteredProducts(products)
        return
      }
      filterAndSortProducts()
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [products, deferredSearch, priceRange, selectedCategories, selectedColors, selectedSizes, minRating, sortBy])

  useEffect(() => {
    setCurrentPage(1)
  }, [deferredSearch, priceRange, selectedCategories, selectedColors, selectedSizes, minRating, sortBy, pageSize])

  useEffect(() => {
    onFiltersChange?.({
      searchTerm,
      sortBy,
      priceRange,
      selectedCategories,
      selectedColors,
      selectedSizes,
      minRating
    })
  }, [searchTerm, sortBy, priceRange, selectedCategories, selectedColors, selectedSizes, minRating, onFiltersChange])

  const filterAndSortProducts = () => {
    setIsLoading(true)
    
    console.log("🔍 Filtering products...");
    console.log("  Total products:", products.length);
    console.log("  Price range:", priceRange);
    console.log("  Filter options maxPrice:", filterOptions.maxPrice);
    
    let filtered = products.filter(product => {
      const ratingValue = getNumericRating(product.rating)
      const matchesSearch = !deferredSearch || 
        product.name.toLowerCase().includes(deferredSearch.toLowerCase()) ||
        product.description?.toLowerCase().includes(deferredSearch.toLowerCase())
      
      const productPrice = Number(product.price) || 0
      // Handle case where priceRange might be stale (0) when products first load
      // If both priceRange[1] and filterOptions.maxPrice are 0, don't filter by price yet
      const shouldFilterByPrice = priceRange[1] > 0 || filterOptions.maxPrice > 0
      const effectiveMaxPrice = priceRange[1] > 0 ? priceRange[1] : filterOptions.maxPrice
      
      const matchesPrice = !shouldFilterByPrice || (productPrice >= priceRange[0] && productPrice <= effectiveMaxPrice)
      
      const matchesCategory = selectedCategories.length === 0 || 
        selectedCategories.includes(product.category?.name)
      
      const matchesColor = selectedColors.length === 0 || 
        (product.colors && product.colors.some(color => selectedColors.includes(color)))
      
      const matchesSize = selectedSizes.length === 0 || 
        (product.sizes && product.sizes.some(size => selectedSizes.includes(size)))
      
      const matchesRating = !minRating || ratingValue >= minRating
      
      const result = matchesSearch && matchesPrice && matchesCategory && matchesColor && matchesSize && matchesRating
      
      // Log first product details for debugging
      if (products.indexOf(product) === 0) {
        console.log("  First product check:", {
          name: product.name,
          price: productPrice,
          priceRange,
          shouldFilterByPrice,
          effectiveMaxPrice,
          matchesSearch,
          matchesPrice,
          matchesCategory,
          matchesColor,
          matchesSize,
          matchesRating,
          result
        });
      }
      
      return result
    })
    
    console.log("  Filtered products:", filtered.length);

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'price-low':
          return (Number(a.price) || 0) - (Number(b.price) || 0)
        case 'price-high':
          return (Number(b.price) || 0) - (Number(a.price) || 0)
        case 'rating':
          return getNumericRating(b.rating) - getNumericRating(a.rating)
        case 'newest':
        default:
          return 0
      }
    })

    setTimeout(() => {
      setFilteredProducts(filtered)
      setIsLoading(false)
    }, 200)
  }

  const clearAllFilters = () => {
    setSearchTerm('')
    setPriceRange([0, filterOptions.maxPrice])
    setSelectedCategories([])
    setSelectedColors([])
    setSelectedSizes([])
    setMinRating(0)
  }

  const activeFiltersCount = selectedCategories.length + selectedColors.length + selectedSizes.length + (minRating > 0 ? 1 : 0)

  const handleFilterChange = (type: string, value: string, checked: boolean) => {
    switch (type) {
      case 'category':
        setSelectedCategories(prev => 
          checked ? [...prev, value] : prev.filter(c => c !== value)
        )
        break
      case 'color':
        setSelectedColors(prev => 
          checked ? [...prev, value] : prev.filter(c => c !== value)
        )
        break
      case 'size':
        setSelectedSizes(prev => 
          checked ? [...prev, value] : prev.filter(s => s !== value)
        )
        break
    }
  }

  const removeFilter = (type: string, value: string) => {
    switch (type) {
      case 'category':
        setSelectedCategories(prev => prev.filter(c => c !== value))
        break
      case 'color':
        setSelectedColors(prev => prev.filter(c => c !== value))
        break
      case 'size':
        setSelectedSizes(prev => prev.filter(s => s !== value))
        break
      case 'rating':
        setMinRating(0)
        break
    }
  }

  const totalPages = useServerPagination
    ? (serverPagination?.totalPages || 1)
    : Math.max(1, Math.ceil(filteredProducts.length / pageSize))
  const safeCurrentPage = useServerPagination
    ? (serverPagination?.page || 1)
    : Math.min(currentPage, totalPages)
  const startIndex = useServerPagination
    ? ((serverPagination?.page || 1) - 1) * (serverPagination?.limit || 1)
    : (safeCurrentPage - 1) * pageSize
  const endIndex = useServerPagination
    ? startIndex + (serverPagination?.limit || 1)
    : startIndex + pageSize
  const paginatedProducts = useServerPagination ? filteredProducts : filteredProducts.slice(startIndex, endIndex)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20">
      {/* Enhanced Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
        <div className="w-full px-6 py-4">
          {/* Search and Controls */}
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between w-full">
            {/* Search Bar */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="البحث عن منتج..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 bg-white/90 dark:bg-gray-800/90 border-gray-200 dark:border-gray-700 rounded-2xl h-12 focus:ring-2 focus:ring-blue-500/20"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              {/* Sort */}
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger className="w-[180px] bg-white/90 dark:bg-gray-800/90 border-gray-200 dark:border-gray-700 rounded-xl h-12">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-gray-200 dark:border-gray-700">
                  <SelectItem value="newest">الأحدث</SelectItem>
                  <SelectItem value="name">الاسم</SelectItem>
                  <SelectItem value="price-low">السعر: منخفض إلى عالي</SelectItem>
                  <SelectItem value="price-high">السعر: عالي إلى منخفض</SelectItem>
                  <SelectItem value="rating">التقييم</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode */}
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={`rounded-lg ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={`rounded-lg ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="lg:hidden bg-white/90 dark:bg-gray-800/90 border-gray-200 dark:border-gray-700 rounded-xl h-12 px-4"
              >
                <Filter className="h-4 w-4 mr-2" />
                فلتر
                {activeFiltersCount > 0 && (
                  <span className="ml-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          <AnimatePresence>
            {(selectedCategories.length > 0 || selectedColors.length > 0 || selectedSizes.length > 0 || minRating > 0) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 flex flex-wrap gap-2 items-center"
              >
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">الفلاتر النشطة:</span>
                
                {selectedCategories.map(category => (
                  <motion.div
                    key={`category-${category}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm"
                  >
                    <Tag className="h-3 w-3" />
                    {category}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFilter('category', category)}
                      className="h-4 w-4 p-0 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full ml-1"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </motion.div>
                ))}

                {selectedColors.map(color => (
                  <motion.div
                    key={`color-${color}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="flex items-center gap-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm"
                  >
                    <div
                      className="h-3 w-3 rounded-full border border-white shadow-sm"
                      style={{ backgroundColor: color.toLowerCase() }}
                    />
                    {color}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFilter('color', color)}
                      className="h-4 w-4 p-0 hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full ml-1"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </motion.div>
                ))}

                {selectedSizes.map(size => (
                  <motion.div
                    key={`size-${size}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm"
                  >
                    <Ruler className="h-3 w-3" />
                    {size}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFilter('size', size)}
                      className="h-4 w-4 p-0 hover:bg-green-200 dark:hover:bg-green-800 rounded-full ml-1"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </motion.div>
                ))}

                {minRating > 0 && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-full text-sm"
                  >
                    <Star className="h-3 w-3 fill-current" />
                    {minRating}+ نجوم
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFilter('rating', '')}
                      className="h-4 w-4 p-0 hover:bg-yellow-200 dark:hover:bg-yellow-800 rounded-full ml-1"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </motion.div>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  مسح الكل
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="w-full px-6 py-8">
        <div className="flex flex-col lg:flex-row-reverse gap-8">
          {/* Enhanced Filter Sidebar */}
          <AnimatePresence>
            {(isFilterOpen || isDesktop) && (
              <motion.div
                initial={{ opacity: 0, x: -300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -300 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="lg:w-80 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl p-6 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    الفلترة
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsFilterOpen(false)}
                    className="lg:hidden"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-8">
                  {/* Price Range */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">نطاق السعر</h3>
                    </div>
                    <div className="space-y-4">
                      {/* Price Input Fields */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">من</label>
                          <div className="relative">
                            <Input
                              type="number"
                              value={priceRange[0]}
                              onChange={(e) => {
                                const value = Math.max(0, parseInt(e.target.value) || 0)
                                setPriceRange([value, priceRange[1]])
                              }}
                              className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl text-sm h-10 pr-8"
                              min="0"
                              max={filterOptions.maxPrice}
                            />
                            <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">د.ع</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">إلى</label>
                          <div className="relative">
                            <Input
                              type="number"
                              value={priceRange[1]}
                              onChange={(e) => {
                                const value = Math.min(filterOptions.maxPrice, parseInt(e.target.value) || filterOptions.maxPrice)
                                setPriceRange([priceRange[0], value])
                              }}
                              className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl text-sm h-10 pr-8"
                              min={priceRange[0]}
                              max={filterOptions.maxPrice}
                            />
                            <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">د.ع</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Visual Slider */}
                      <div className="px-2">
                        <div className="relative mb-4">
                          <DualRangeSlider
                            min={0}
                            max={filterOptions.maxPrice}
                            step={1000}
                            value={priceRange}
                            onChange={setPriceRange}
                          />
                          {/* Labels for handles */}
                          <div className="flex justify-between items-center mt-3">
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-sm"></div>
                              <span className="text-xs text-gray-600 dark:text-gray-400">الحد الأدنى</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400">الحد الأقصى</span>
                              <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-sm"></div>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                          <span>0 د.ع</span>
                          <span>{filterOptions.maxPrice.toLocaleString()} د.ع</span>
                        </div>
                      </div>

                      {/* Quick Price Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPriceRange([0, Math.min(50000, filterOptions.maxPrice)])}
                          className="text-xs h-8 rounded-lg bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                        >
                          تحت 50,000
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPriceRange([50000, Math.min(200000, filterOptions.maxPrice)])}
                          className="text-xs h-8 rounded-lg bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                        >
                          50K - 200K
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPriceRange([200000, Math.min(500000, filterOptions.maxPrice)])}
                          className="text-xs h-8 rounded-lg bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                        >
                          200K - 500K
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPriceRange([500000, filterOptions.maxPrice])}
                          className="text-xs h-8 rounded-lg bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                        >
                          500K+
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Rating Filter */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">التقييم</h3>
                    </div>
                    <Select value={minRating.toString()} onValueChange={(value) => setMinRating(Number(value))}>
                      <SelectTrigger className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl">
                        <SelectValue placeholder="اختر التقييم الأدنى" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="0">جميع التقييمات</SelectItem>
                        <SelectItem value="3">3 نجوم فأكثر</SelectItem>
                        <SelectItem value="4">4 نجوم فأكثر</SelectItem>
                        <SelectItem value="4.5">4.5 نجوم فأكثر</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Categories */}
                  {filterOptions.categories.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4 text-green-500" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">التصنيفات</h3>
                      </div>
                      <div className="space-y-3 max-h-48 overflow-y-auto">
                        {filterOptions.categories.map((category) => (
                          <motion.div
                            key={category}
                            whileHover={{ scale: 1.02 }}
                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          >
                            <Checkbox
                              id={`category-${category}`}
                              checked={selectedCategories.includes(category)}
                              onCheckedChange={(checked) => handleFilterChange('category', category, checked as boolean)}
                              className="rounded-md"
                            />
                            <label
                              htmlFor={`category-${category}`}
                              className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer flex-1"
                            >
                              {category}
                            </label>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Colors */}
                  {filterOptions.colors.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Palette className="h-4 w-4 text-purple-500" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">الألوان</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {filterOptions.colors.map((color) => (
                          <motion.div
                            key={color}
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          >
                            <Checkbox
                              id={`color-${color}`}
                              checked={selectedColors.includes(color)}
                              onCheckedChange={(checked) => handleFilterChange('color', color, checked as boolean)}
                              className="rounded-md"
                            />
                            <div className="flex items-center gap-2 flex-1">
                              <div
                                className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                                style={{ backgroundColor: color.toLowerCase() }}
                              />
                              <label
                                htmlFor={`color-${color}`}
                                className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                              >
                                {color}
                              </label>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sizes */}
                  {filterOptions.sizes.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Ruler className="h-4 w-4 text-orange-500" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">المقاسات</h3>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {filterOptions.sizes.map((size) => (
                          <motion.label
                            key={size}
                            whileHover={{ scale: 1.05 }}
                            className={`
                              flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all
                              ${selectedSizes.includes(size)
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                              }
                            `}
                          >
                            <input
                              type="checkbox"
                              checked={selectedSizes.includes(size)}
                              onChange={(e) => handleFilterChange('size', size, e.target.checked)}
                              className="sr-only"
                            />
                            <span className="text-sm font-semibold">{size}</span>
                          </motion.label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Products Section */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {isLoading ? 'جاري البحث...' : `${filteredProducts.length} منتج`}
                </h3>
                {searchTerm && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    نتائج البحث عن "{searchTerm}"
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">عرض</span>
                  <Select
                    value={String(useServerPagination ? (serverPagination?.limit || pageSize) : pageSize)}
                    onValueChange={(value) => {
                      const next = Number(value)
                      if (useServerPagination) {
                        onPageSizeChange?.(next)
                      } else {
                        setPageSize(next)
                      }
                    }}
                  >
                    <SelectTrigger className="w-[100px] bg-white/90 dark:bg-gray-800/90 border-gray-200 dark:border-gray-700 rounded-xl h-10">
                      <SelectValue placeholder="20" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="lg:hidden"
                >
                  {isFilterOpen ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Loading State */}
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center py-12"
                >
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                    <span className="text-gray-600 dark:text-gray-400">جاري تحديث النتائج...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Products Grid */}
            {!isLoading && (
              <motion.div
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                    : 'grid-cols-1'
                }`}
              >
                {paginatedProducts.map((product) => (
                  <div key={product._id}>
                    <ProductCard {...product} />
                  </div>
                ))}
              </motion.div>
            )}

            {!isLoading && filteredProducts.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  عرض {startIndex + 1}-{Math.min(endIndex, useServerPagination ? (serverPagination?.total || filteredProducts.length) : filteredProducts.length)} من {useServerPagination ? (serverPagination?.total || filteredProducts.length) : filteredProducts.length}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={safeCurrentPage === 1}
                    onClick={() => {
                      if (useServerPagination) {
                        onPageChange?.(Math.max(1, safeCurrentPage - 1))
                      } else {
                        setCurrentPage((p) => Math.max(1, p - 1))
                      }
                    }}
                    className="rounded-lg"
                  >
                    السابق
                  </Button>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {safeCurrentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={safeCurrentPage === totalPages}
                    onClick={() => {
                      if (useServerPagination) {
                        onPageChange?.(Math.min(totalPages, safeCurrentPage + 1))
                      } else {
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                    }}
                    className="rounded-lg"
                  >
                    التالي
                  </Button>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredProducts.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mb-6">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  لم نجد أي منتجات
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                  لا توجد منتجات تطابق معايير البحث والفلترة الحالية. جرب تعديل البحث أو إزالة بعض الفلاتر.
                </p>
                <Button
                  onClick={clearAllFilters}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 rounded-xl px-6"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  مسح جميع الفلاتر
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}