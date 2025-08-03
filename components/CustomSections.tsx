'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import CustomSection from './CustomSection'
import { CustomSection as CustomSectionType } from '@/types'
import { getCustomSections } from '@/lib/api'

export default function CustomSections() {
  const [sections, setSections] = useState<CustomSectionType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSections() {
      try {
        setLoading(true)
        setError(null)
        const sectionsData = await getCustomSections()
        
        // Filter sections that should be shown on homepage
        const homepageSections = sectionsData.filter(section => {
          // مؤقتاً: إظهار جميع الأقسام النشطة للاختبار
          const shouldShow = section.isActive && 
            section.visibility.enabled &&
            (section.visibility.requiredRole === 'public' || section.visibility.requiredRole === 'customer')
          
          console.log(`Section "${section.name.en}" should show:`, shouldShow, {
            isActive: section.isActive,
            enabled: section.visibility.enabled,
            showOnHomepage: section.visibility.showOnHomepage,
            requiredRole: section.visibility.requiredRole,
            productCount: section.activeProducts?.length || section.products?.length || 0
          })
          
          return shouldShow
        })
        
        console.log('All sections:', sectionsData)
        console.log('Homepage sections:', homepageSections)
        
        // Sort by order
        homepageSections.sort((a, b) => a.order - b.order)
        
        setSections(homepageSections)
      } catch (error) {
        console.error('Failed to fetch custom sections:', error)
        setError(error instanceof Error ? error.message : 'Failed to load custom sections')
        setSections([])
      } finally {
        setLoading(false)
      }
    }

    fetchSections()
  }, [])

  if (loading) {
    return (
      <div className="my-16">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">تحميل الأقسام المخصصة...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="my-16">
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">⚠️</div>
          <p className="text-gray-600 mb-4">فشل في تحميل الأقسام المخصصة</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    )
  }

  if (sections.length === 0) {
    return null // Don't render anything if no sections
  }

  return (
    <div className="my-16">
      {sections.map((section, index) => (
        <motion.div
          key={section._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
        >
          <CustomSection 
            section={section} 
          />
        </motion.div>
      ))}
    </div>
  )
}
