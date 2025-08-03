"use client"
// pages/index.js
import HeroSection from '@/components/HeroSection'
import NewArrivals from '@/components/NewArrivals'
import BestSellers from '@/components/BestSellers'
import CategoryCard from '@/components/CategoryCard'
import SimpleCustomSections from '@/components/SimpleCustomSections'
import AboutStore from '@/components/AboutStore'
import ContactForm from '@/components/ContactForm'
import Newsletter from '@/components/Newsletter'
import { getAllCategory } from '@/lib/api'
import { useEffect, useState } from 'react'
import { API_URL } from '@/lib/apiUrl'
import { Category } from '@/types'

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function loadCategories() {
      const data = await getAllCategory();
      setCategories(data);
    }
    loadCategories();
  }, []);

  return (
    <div className="container mx-auto px-4">
      <HeroSection />
      <NewArrivals />
      <BestSellers />
      
      {/* Custom Sections */}
      <SimpleCustomSections />

      {/* Category Cards Section */}
      <section className="my-16">
        <h2 className="text-3xl font-bold mb-8 text-center">التسوق عن طريق الاقسام</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map(category => (
            <CategoryCard
              key={category._id}
              id={category.id}
              name={category.name}
              _id={category._id}
              image={category.image || '/default.jpg'}
            />
          ))}
        </div>
      </section>

      <AboutStore />
      <ContactForm />
      <Newsletter />
    </div>
  )
}
