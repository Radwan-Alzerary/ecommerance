'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import { Button } from '@/components/ui/button'
import { useLanguage } from '../contexts/LanguageContext'
import { translations } from '../utils/translations'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const heroSlides = [
  {
    id: 1,
    title: 'Elevate Your Style',
    subtitle: 'Discover curated collections that define the latest trends',
    image: '/hero-slide-1.jpg',
    link: '/products',
    buttonText: 'Shop Now',
  },
  {
    id: 2,
    title: 'Summer Essentials',
    subtitle: 'Get ready for the season with our hottest picks',
    image: '/hero-slide-2.jpg',
    link: '/categories/summer',
    buttonText: 'Explore Summer',
  },
  {
    id: 3,
    title: 'Tech Innovation',
    subtitle: 'Experience the future with cutting-edge gadgets',
    image: '/hero-slide-3.jpg',
    link: '/categories/electronics',
    buttonText: 'Discover Tech',
  },
]

export default function HeroSection() {
  const { language } = useLanguage()
  const t = (key: keyof typeof translations.en) => translations[language][key]
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <section className="relative h-[80vh] overflow-hidden bg-gray-900">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000 }}
        loop
        className="h-full"
      >
        {heroSlides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative h-full flex items-center justify-center">
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover opacity-50"
                priority
              />
              <div className="relative z-10 text-center text-white max-w-4xl px-4">
                <motion.h1 
                  className="text-5xl md:text-6xl font-bold mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  {t(slide.title as keyof typeof translations.en)}
                </motion.h1>
                <motion.p 
                  className="text-xl md:text-2xl mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  {t(slide.subtitle as keyof typeof translations.en)}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <Button asChild size="lg" className="text-lg px-8 py-6">
                    <Link href={slide.link}>{t(slide.buttonText as keyof typeof translations.en)}</Link>
                  </Button>
                </motion.div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  )
}

