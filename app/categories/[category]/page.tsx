"use client"
import Image from 'next/image'
import ProductGrid from '@/components/ProductGrid'
import { getProductByCategory } from '@/lib/api'
import { useEffect, useState } from 'react'
import { buildAssetUrl } from '@/lib/apiUrl'

export default function CategoryPage({ params }: { params: { category: string } }) {
  const categoryName = decodeURIComponent(params.category)
  const [categoryProduct, setCategoryProduct] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCategoryProduct() {
      try {
        setIsLoading(true)
        setError(null)
        const product = await getProductByCategory(categoryName)
        setCategoryProduct(product)
      } catch (err: any) {
        setError(err?.message || 'فشل تحميل بيانات التصنيف')
        setCategoryProduct(null)
      } finally {
        setIsLoading(false)
      }
    }
    fetchCategoryProduct()
  }, [categoryName])

  if (isLoading) {
    return <div>Loading...</div>
  }
  if (error) {
    return <div>{error}</div>
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
