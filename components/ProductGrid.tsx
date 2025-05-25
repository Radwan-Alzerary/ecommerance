'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ProductCard from './ProductCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Product } from '../types'

interface ProductGridProps {
  products: Product[]
}

export default function ProductGrid({ products }: ProductGridProps) {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products)
  const [searchTerm, setSearchTerm] = useState('')
  const [priceRange, setPriceRange] = useState([0, 1500000])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [minRating, setMinRating] = useState(0)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  console.log(filteredProducts)
  const categories = [...new Set(products.map(product => product.category))]
  const colors = [...new Set(products.flatMap(product => product.colors))]
  const sizes = [...new Set(products.flatMap(product => product.sizes))]

  useEffect(() => {
    const filtered = products.filter(product =>
      (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       product.description?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      product.price >= priceRange[0] &&
      product.price <= priceRange[1] &&
      (selectedCategories.length === 0 || selectedCategories.includes(product.category)) &&
      (selectedColors.length === 0 || product.colors.some(color => selectedColors.includes(color))) &&
      (selectedSizes.length === 0 || product.sizes.some(size => selectedSizes.includes(size))) 
      // product.rating >= minRating
    )
    setFilteredProducts(filtered)
  }, [products, searchTerm, priceRange, selectedCategories, selectedColors, selectedSizes, minRating])

  const handleCategoryChange = (category: string, checked: boolean) => {
    setSelectedCategories(prev =>
      checked ? [...prev, category] : prev.filter(c => c !== category)
    )
  }

  const handleColorChange = (color: string, checked: boolean) => {
    setSelectedColors(prev =>
      checked ? [...prev, color] : prev.filter(c => c !== color)
    )
  }

  const handleSizeChange = (size: string, checked: boolean) => {
    setSelectedSizes(prev =>
      checked ? [...prev, size] : prev.filter(s => s !== size)
    )
  }

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <Input
          type="text"
          placeholder="البحث عن منتج"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
        <Select onValueChange={(value) => setMinRating(Number(value))}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Any rating</SelectItem>
            <SelectItem value="3">3 stars & above</SelectItem>
            <SelectItem value="4">4 stars & above</SelectItem>
            <SelectItem value="4.5">4.5 stars & above</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filter sidebar */}
        <motion.div 
          className={`md:w-1/4 bg-white p-4 rounded-lg shadow-md ${isFilterOpen ? 'block' : 'hidden md:block'}`}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-semibold mb-4">الفلترة</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">فلترة سعرية</h3>
              <Slider
                min={0}
                max={1500000}
                step={10}
                value={priceRange}
                onValueChange={setPriceRange}
              />
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>د.ع{priceRange[0]}</span>
                <span>د.ع{priceRange[1]}</span>
              </div>
            </div>
            {/* <div>
              <h3 className="font-semibold mb-2">Categories</h3>
              {categories.map((category) => (
                <div key={category} className="flex items-center mb-2">
                  <Checkbox
                    id={`category-${category}`}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                  />
                  <label htmlFor={`category-${category}`} className="ml-2 text-sm">
                    {category}
                  </label>
                </div>
              ))}
            </div> */}
            <div>
              <h3 className="font-semibold mb-2">Colors</h3>
              {colors.map((color) => (
                <div key={color} className="flex items-center mb-2">
                  <Checkbox
                    id={`color-${color}`}
                    checked={selectedColors.includes(color)}
                    onCheckedChange={(checked) => handleColorChange(color, checked as boolean)}
                  />
                  <label htmlFor={`color-${color}`} className="ml-2 text-sm">
                    {color}
                  </label>
                </div>
              ))}
            </div>
            <div>
              <h3 className="font-semibold mb-2">Sizes</h3>
              {sizes.map((size) => (
                <div key={size} className="flex items-center mb-2">
                  <Checkbox
                    id={`size-${size}`}
                    checked={selectedSizes.includes(size)}
                    onCheckedChange={(checked) => handleSizeChange(size, checked as boolean)}
                  />
                  <label htmlFor={`size-${size}`} className="ml-2 text-sm">
                    {size}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Product grid */}
        <div className="md:w-3/4">
          <div className="mb-4 md:hidden">
            <Button onClick={() => setIsFilterOpen(!isFilterOpen)}>
              {isFilterOpen ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product._id} 
                {...product}
              />
            ))}
          </motion.div>
          {filteredProducts.length === 0 && (
            <p className="text-center text-gray-500 mt-8">No products found matching your criteria.</p>
          )}
        </div>
      </div>
    </div>
  )
}

