import CategoryCard from './CategoryCard'
import { categoryImages } from '../data/dummyData'
import { Category } from '@/types'

interface CategoryListProps extends Category {}

export default function CategoryList({ id,name,image }: CategoryListProps) {
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

