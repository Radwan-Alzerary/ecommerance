'use client'; // Mark this component as a Client Component

import ProductGrid from '@/components/ProductGrid';
import { getAllProduct } from '@/lib/api';
import { useEffect, useRef, useState } from 'react';
import type { Product } from '@/types';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  // Prevent double fetch in React 18 Strict Mode (dev) and guard unmount
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) return; // skip the second dev invocation
    hasFetchedRef.current = true;

    let isMounted = true;
    const fetchProducts = async () => {
      try {
        const productData = await getAllProduct();
        if (isMounted) setProducts(productData);
        
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    fetchProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductGrid products={products} />
    </div>
  );
}
