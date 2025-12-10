'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ProductCard from './ProductCard'
import { Product } from '../types'
import { getAllProduct } from '@/lib/api'

interface RelatedProductsProps {
  currentProductId: string
}

export default function RelatedProducts({ currentProductId }: RelatedProductsProps) {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const products = await getAllProduct();
        if (!isMounted) return;

        const filtered = products
          .filter(product => product.id !== currentProductId)
          .slice(0, 4);
        setRelatedProducts(filtered);
      } catch (e) {
        console.error('Failed to load related products', e);
      }
    })();

    return () => {
      isMounted = false;
    }
  }, [currentProductId])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {relatedProducts.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <ProductCard {...product} />
        </motion.div>
      ))}
    </div>
  )
}

