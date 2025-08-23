"use client"
import Image from 'next/image'
import ProductGrid from '@/components/ProductGrid'
import { getProductByCategory } from '@/lib/api'
import { useEffect, useState } from 'react'
import { buildAssetUrl } from '@/lib/apiUrl'

export default function CategoryPage({ params }: { params: { category: string } }) {
  const categoryName = decodeURIComponent(params.category)
  const [categoryProduct, setCategoryProduct] = useState<any>(null)

  useEffect(() => {
    async function fetchCategoryProduct() {
      // Await the async function to get the product by category
      const product = await getProductByCategory(categoryName)
      setCategoryProduct(product)
    }
    fetchCategoryProduct()
  }, [categoryName])

  if (!categoryProduct) {
    return <div>Loading...</div>
  }
// console.log('Category hero image:', buildAssetUrl(categoryProduct.image?.url))
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 relative h-64 rounded-lg overflow-hidden">
        <Image
          src={buildAssetUrl(categoryProduct.image?.url) || '/placeholder.svg'}
          alt={categoryProduct.name}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <h1 className="text-4xl font-bold text-white">{categoryProduct.name}</h1>
        </div>
      </div>
      <ProductGrid products={categoryProduct.foods} />
    </div>
  )
}
