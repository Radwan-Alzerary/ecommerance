"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ProductProfile from '@/components/ProductProfile'
import { getProduct } from '@/lib/api'

export default function ProductPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [product, setProduct] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const id = params?.id
    if (!id) return

    let isActive = true
    setIsLoading(true)
    setHasError(false)

    getProduct(id)
      .then((data) => {
        if (!isActive) return
        setProduct(data ?? null)
      })
      .catch(() => {
        if (!isActive) return
        setHasError(true)
      })
      .finally(() => {
        if (!isActive) return
        setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [params?.id])

  if (isLoading) {
    return (
      <div className="w-full max-w-full overflow-x-hidden">
        <div className="container mx-auto px-4 py-16 text-center">جاري تحميل المنتج...</div>
      </div>
    )
  }

  if (hasError || !product) {
    return (
      <div className="w-full max-w-full overflow-x-hidden">
        <div className="container mx-auto px-4 py-16 text-center">
          تعذر تحميل المنتج. <button className="underline" onClick={() => router.push('/products')}>العودة للمنتجات</button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <ProductProfile product={product} />
    </div>
  )
}
