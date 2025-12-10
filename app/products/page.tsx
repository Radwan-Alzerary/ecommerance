'use client'; // Mark this component as a Client Component

import ProductGrid from '@/components/ProductGrid';
import { getAllProduct } from '@/lib/api';
import { useEffect, useRef, useState } from 'react';
import type { Product } from '@/types';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("🔄 useEffect triggered");
    
    let isMounted = true;
    const fetchProducts = async () => {
      try {
        console.log("🚀 Starting to fetch products...");
        setIsLoading(true);
        const productData = await getAllProduct();
        console.log("✅ Raw API response:", productData);
        console.log("📊 Type of response:", typeof productData);
        console.log("📊 Is array:", Array.isArray(productData));
        console.log("📊 Number of products:", productData?.length || 0);
        console.log("📦 First product sample:", productData?.[0]);
        
        if (isMounted) {
          if (Array.isArray(productData)) {
            setProducts(productData);
            console.log("✅ Products set successfully:", productData.length);
          } else {
            console.error("⚠️ API response is not an array!", productData);
          }
        }
        
      } catch (error) {
        console.error("❌ Failed to fetch products:", error);
        console.error("❌ Error details:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  console.log("🎯 ProductsPage - Rendering with products:", products.length);

  return (
    <div className="container mx-auto px-4 py-8">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">جاري تحميل المنتجات...</p>
          </div>
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
