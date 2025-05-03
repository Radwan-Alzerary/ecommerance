'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useLanguage } from '../contexts/LanguageContext'
import { translations } from '../utils/translations'
import { Category } from '@/types'

interface CategoryCardProps extends Category {}

export default function CategoryCard({ name, image,_id }: CategoryCardProps) {
  const { language } = useLanguage()
  const t = (key: keyof typeof translations.en) => translations[language][key]

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-lg shadow-lg"
    >
      <Link href={`/categories/${_id}`}>
        <div className="relative h-48 w-full">
          <Image
            src={image || "/placeholder.svg"}
            alt={name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <h3 className="text-white text-2xl font-bold">{t(name.toLowerCase() as keyof typeof translations.en)}</h3>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

