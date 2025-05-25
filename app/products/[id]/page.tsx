import { notFound } from 'next/navigation'
import Link from 'next/link'
import { dummyProducts } from '@/data/dummyData'
import ProductProfile from '@/components/ProductProfile'
import { ChevronRight } from 'lucide-react'
import { getProduct } from '@/lib/api'

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id)
console.log(product)
  if (!product) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="flex mb-8" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link href="/" className="text-gray-700 hover:text-blue-600">
              Home
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <ChevronRight className="w-5 h-5 text-gray-400" />
              <Link href="/products" className="ml-1 text-gray-700 hover:text-blue-600 md:ml-2">
                Products
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <ChevronRight className="w-5 h-5 text-gray-400" />
              <span className="ml-1 text-gray-500 md:ml-2">{product.name}</span>
            </div>
          </li>
        </ol>
      </nav>
      <ProductProfile product={product} />
    </div>
  )
}
