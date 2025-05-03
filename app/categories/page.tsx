import { categoryImages } from '@/data/dummyData'
import CategoryList from '@/components/CategoryList'
import { useEffect, useState } from 'react';
import { getAllCategory } from '@/lib/api';

export const metadata = {
  title: 'Product Categories | ModernShop',
  description: 'Explore our wide range of product categories at ModernShop.',
}

export default function CategoriesPage() {
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Product Categories</h1>
      <CategoryList categories={category} />
    </div>
  )
}

