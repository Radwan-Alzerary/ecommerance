'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules'
import { Button } from '@/components/ui/button'
import { useLanguage } from '../contexts/LanguageContext'
import { translations } from '../utils/translations'
import { ChevronRight, Play, Sparkles, ArrowDown } from 'lucide-react'
import { getHeroSlides } from '@/lib/api'
import { buildAssetUrl } from '@/lib/apiUrl'
import { HeroSlide } from '@/types'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'

const FloatingElement = ({ delay = 0, children, className = '' }: {
  delay?: number;
  children: React.ReactNode;
  className?: string;
}) => (
  <motion.div
    className={`absolute ${className}`}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: [0, 1, 1, 0],
      scale: [0, 1, 1, 0],
      y: [0, -20, -40, -60]
    }}
    transition={{
      duration: 4,
      delay,
      repeat: Infinity,
      repeatDelay: 2
    }}
  >
    {children}
  </motion.div>
)

const ImageWithFallback = ({ src, fallbackSrc, alt, ...props }: {
  src: string;
  fallbackSrc: string;
  alt: string;
  [key: string]: any;
}) => {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (!hasError && fallbackSrc) {
      setHasError(true)
      setImgSrc(fallbackSrc)
    }
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      onError={handleError}
      {...props}
    />
  )
}

const ProgressBar = ({ progress }: { progress: number }) => (
  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-64 h-1 bg-white/20 rounded-full overflow-hidden">
    <motion.div 
      className="h-full bg-gradient-to-r from-white to-white/80 rounded-full"
      initial={{ width: '0%' }}
      animate={{ width: `${progress}%` }}
      transition={{ duration: 0.3 }}
    />
  </div>
)

export default function HeroSection() {
  const { language } = useLanguage()
  const t = (key: string) => (translations[language] as any)?.[key] || key
  
  // Helper function to get translated text from slide or fallback to translations
  const getSlideText = (slide: HeroSlide, field: 'title' | 'subtitle' | 'description' | 'buttonText') => {
    // First check if slide has translations for current language
    if (slide.translations && slide.translations[language] && slide.translations[language][field]) {
      return slide.translations[language][field]
    }
    // Fallback to default field value and then apply global translations
    return t(slide[field])
  }
  
  const [mounted, setMounted] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const [scrollTarget, setScrollTarget] = useState<HTMLElement | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const swiperRef = useRef<any>(null)
  const containerRef = useRef<HTMLElement | null>(null)
  
  const { scrollYProgress } = useScroll({
    target: isHydrated ? scrollTarget ?? undefined : undefined,
    offset: ["start start", "end start"]
  })
  
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -100])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1])

  // Fetch hero slides from API
  const fetchHeroSlides = async () => {
    try {
      setLoading(true)
      setError(null)
      const slides = await getHeroSlides()
      setHeroSlides(slides)
    } catch (error) {
      console.error('Failed to fetch hero slides:', error)
      setError(error instanceof Error ? error.message : 'Failed to load hero slides')
      setHeroSlides([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setMounted(true)
    setIsHydrated(true)
    fetchHeroSlides()
  }, [])

  useEffect(() => {
    if (containerRef.current) {
      setScrollTarget(containerRef.current)
    }
  }, [containerRef])

  const slideVariants = {
    enter: {
      opacity: 0,
      scale: 1.1
    },
    center: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 1,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.5
      }
    }
  }

  const contentVariants = {
    hidden: {
      opacity: 0,
      y: 60,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  }

  if (!mounted || loading) {
    return (
      <div className="h-[100vh] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-white text-xl font-light"
        >
          Loading...
        </motion.div>
      </div>
    )
  }

  if (heroSlides.length === 0 && !loading) {
    return (
      <div className="h-[100vh] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-white text-center space-y-4 max-w-2xl px-6"
        >
          <div className="text-6xl mb-4">🔌</div>
          <h2 className="text-2xl font-bold">Hero Slides API Not Available</h2>
          <p className="text-gray-400 leading-relaxed">
            {error?.includes('API endpoints are not available') 
              ? 'The hero slides API endpoints are not deployed yet. Please check the backend setup documentation.' 
              : error || 'Unable to load promotional content at the moment.'}
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-gray-800/50 p-4 rounded-lg text-left text-sm">
              <p className="text-yellow-400 font-semibold mb-2">Developer Info:</p>
              <p className="text-gray-300">
                Missing API endpoints:<br/>
                • <code>/online/hero-slides</code><br/>
                • <code>/api/hero-slides</code><br/>
                <br/>
                Check <code>BACKEND_SETUP_REQUIRED.md</code> for setup instructions.
              </p>
            </div>
          )}
          
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={() => fetchHeroSlides()} 
              className="bg-white text-black hover:bg-gray-100"
            >
              Try Again
            </Button>
            <Button 
              onClick={() => window.location.href = '/products'} 
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              Browse Products
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <section ref={containerRef} className="relative h-[100vh] overflow-hidden">
      {/* Background with parallax */}
      <motion.div 
        style={{ y: parallaxY, scale }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-transparent to-black/30 z-10" />
        <Swiper
          ref={swiperRef}
          modules={[Navigation, Pagination, Autoplay, EffectFade]}
          effect="fade"
          navigation={{
            nextEl: '.swiper-button-next-custom',
            prevEl: '.swiper-button-prev-custom',
          }}
          pagination={false}
          autoplay={{ 
            delay: 6000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
          }}
          loop
          speed={1000}
          onSlideChange={(swiper) => setCurrentSlide(swiper.realIndex)}
          className="h-full"
        >
          {heroSlides.map((slide, index) => (
            <SwiperSlide key={slide.id}>
              <motion.div 
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="relative h-full"
              >
                <ImageWithFallback
                  src={buildAssetUrl(slide.image)}
                  fallbackSrc={buildAssetUrl(slide.fallbackImage) || slide.fallbackImage}
                  alt={slide.title}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  quality={90}
                />
                {/* Gradient overlays for different themes */}
                <div className={`absolute inset-0 ${
                  slide.theme === 'luxury' ? 'bg-gradient-to-r from-black/70 via-black/30 to-transparent' :
                  slide.theme === 'vibrant' ? 'bg-gradient-to-br from-orange-900/40 via-transparent to-pink-900/40' :
                  'bg-gradient-to-t from-blue-900/50 via-transparent to-purple-900/30'
                }`} />
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </motion.div>

      {/* Floating decorative elements */}
      <FloatingElement delay={0} className="top-20 left-10">
        <Sparkles className="w-6 h-6 text-white/30" />
      </FloatingElement>
      <FloatingElement delay={1} className="top-32 right-20">
        <div className="w-3 h-3 bg-white/20 rounded-full" />
      </FloatingElement>
      <FloatingElement delay={2} className="top-40 left-1/3">
        <div className="w-2 h-2 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full" />
      </FloatingElement>

      {/* Main content */}
      <div className="relative z-20 h-full flex items-center">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-center">
            {/* Left content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="text-white space-y-8 max-w-3xl mx-auto text-center"
              >
                {/* Stats badge */}
                <motion.div variants={itemVariants} className="flex justify-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-sm font-medium">
                      {heroSlides[currentSlide]?.stats.value} {heroSlides[currentSlide]?.stats.label}
                    </span>
                  </div>
                </motion.div>

                {/* Main heading */}
                <motion.div variants={itemVariants} className="space-y-4">
                  <h1 className="text-6xl lg:text-7xl font-bold tracking-tight">
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
                      {getSlideText(heroSlides[currentSlide], 'title')}
                    </span>
                  </h1>
                  <p className="text-xl lg:text-2xl text-gray-200 leading-relaxed">
                    {getSlideText(heroSlides[currentSlide], 'subtitle')}
                  </p>
                  <p className="text-gray-400 leading-relaxed">
                    {getSlideText(heroSlides[currentSlide], 'description')}
                  </p>
                </motion.div>

                {/* Action buttons */}
                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="group relative overflow-hidden bg-white text-black hover:bg-gray-100 border-0 px-8 py-6 text-lg font-semibold rounded-2xl transition-all duration-300">
                    <Link href={heroSlides[currentSlide]?.link || '#'} className="flex items-center gap-2">
                      <span>{getSlideText(heroSlides[currentSlide], 'buttonText')}</span>
                      <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>
            </AnimatePresence>


          </div>
        </div>
      </div>

      {/* Custom navigation */}
      <div className="absolute left-8 top-1/2 transform -translate-y-1/2 z-30">
        <button className="swiper-button-prev-custom w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300">
          <ChevronRight className="w-5 h-5 rotate-180" />
        </button>
      </div>
      <div className="absolute right-8 top-1/2 transform -translate-y-1/2 z-30">
        <button className="swiper-button-next-custom w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Progress indicator */}
      <div className="absolute bottom-8 left-8 z-30 flex gap-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => swiperRef.current?.swiper?.slideTo(index)}
            className={`w-12 h-1 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-white' 
                : 'bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>

      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-8 right-8 z-30 flex flex-col items-center gap-2 text-white/70"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2 }}
      >
        <span className="text-sm font-medium rotate-90 whitespace-nowrap origin-center">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ArrowDown className="w-4 h-4" />
        </motion.div>
      </motion.div>

      {/* Ambient background effects */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500/10 rounded-full filter blur-3xl animate-pulse delay-1000" />
      </div>
    </section>
  )
}