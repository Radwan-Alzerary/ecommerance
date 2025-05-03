import ProductCard from './ProductCard'

const recommendations = [
  { id: '9', name: 'Recommended 1', price: 24.99, image: '/placeholder.svg' },
  { id: '10', name: 'Recommended 2', price: 34.99, image: '/placeholder.svg' },
  { id: '11', name: 'Recommended 3', price: 44.99, image: '/placeholder.svg' },
  { id: '12', name: 'Recommended 4', price: 54.99, image: '/placeholder.svg' },
]

export default function RandomRecommendations() {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">You Might Also Like</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendations.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  )
}

