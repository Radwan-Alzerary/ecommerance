'use client'
import CategoryCard from './CategoryCard'
import { useEffect, useState } from 'react'
import { getAllCategory } from '@/lib/api'
import { Category } from '@/types'

export default function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      try {
        const data = await getAllCategory()
        setCategories(data)
      } catch (e: any) {
        setError('Failed to load categories')
        console.error(e)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) return <div>Loading categories...</div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map(cat => (
        <CategoryCard
          key={cat._id || cat.id}
          name={cat.name}
          image={(cat as any).image?.url || '/placeholder.svg'}
        />
      ))}
    </div>
  )
}

