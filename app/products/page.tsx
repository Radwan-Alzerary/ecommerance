'use client'; // Mark this component as a Client Component

import ProductGrid from '@/components/ProductGrid';
import { getAllProduct } from '@/lib/api';
import { useEffect, useState } from 'react';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productData = await getAllProduct();
        setProducts(productData);
        console.log(productData);
        
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductGrid products={products} />
    </div>
  );
}
