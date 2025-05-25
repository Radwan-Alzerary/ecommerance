'use client'
import CategoryCard from './CategoryCard'
import { categoryImages } from '../data/dummyData'
import { Category } from '@/types'
import { useEffect, useState } from 'react';

interface CategoryListProps extends Category {}

export default function CategoryList({ id,name,image }: CategoryListProps) {
    // const categories = Object.keys(categoryImages)
  const [category, setCategory] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const categoryDate = await getAllCategory();
        setCategory(categoryDate);
        console.log(categoryDate);
        
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    fetchProducts();
  }, []);



  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* {categories.map((category) => (
        <CategoryCard 
          key={category} 
          name={category} 
          image={categoryImages[category] || '/placeholder.svg'} 
        />
      ))} */}
    </div>
  )
}

