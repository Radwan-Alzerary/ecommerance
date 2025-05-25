import { categoryImages } from '@/data/dummyData'
import CategoryList from '@/components/CategoryList'
import { getAllCategory } from '@/lib/api';

export const metadata = {
  title: 'Product Categories | ModernShop',
  description: 'Explore our wide range of product categories at ModernShop.',
}

export default function CategoriesPage() {

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Product Categories</h1>
      <CategoryList />
    </div>
  )
}

