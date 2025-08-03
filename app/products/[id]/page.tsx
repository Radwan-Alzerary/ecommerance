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
    <div className="w-full max-w-full overflow-x-hidden">
      <ProductProfile product={product} />
    </div>
  )
}
