'use client'; // Mark this component as a Client Component

import ProductGrid from '@/components/ProductGrid';
import { getProductsPaginated, PaginatedProductsResult } from '@/lib/api';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Product } from '@/types';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'rating' | 'name'>('newest');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const q = searchParams;
    if (!q) return;

    const qp = q.get('page');
    const ql = q.get('limit');
    const qs = q.get('search');
    const qsort = q.get('sort') as typeof sortBy | null;
    const qmin = q.get('minPrice');
    const qmax = q.get('maxPrice');
    const qcat = q.get('categories');
    const qcolors = q.get('colors');
    const qsizes = q.get('sizes');
    const qrating = q.get('rating');

    if (qp) setPage(Number(qp) || 1);
    if (ql) setLimit(Number(ql) || 20);
    if (typeof qs === 'string') setSearchTerm(qs);
    if (qsort) setSortBy(qsort);
    if (qmin || qmax) {
      setPriceRange([Number(qmin) || 0, Number(qmax) || 0]);
    }
    if (qcat) setSelectedCategories(qcat.split(',').filter(Boolean));
    if (qcolors) setSelectedColors(qcolors.split(',').filter(Boolean));
    if (qsizes) setSelectedSizes(qsizes.split(',').filter(Boolean));
    if (qrating) setMinRating(Number(qrating) || 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (page > 1) params.set('page', String(page));
    if (limit !== 20) params.set('limit', String(limit));
    if (searchTerm) params.set('search', searchTerm);
    if (sortBy && sortBy !== 'newest') params.set('sort', sortBy);
    if (priceRange[0] > 0) params.set('minPrice', String(priceRange[0]));
    if (priceRange[1] > 0) params.set('maxPrice', String(priceRange[1]));
    if (selectedCategories.length) params.set('categories', selectedCategories.join(','));
    if (selectedColors.length) params.set('colors', selectedColors.join(','));
    if (selectedSizes.length) params.set('sizes', selectedSizes.join(','));
    if (minRating > 0) params.set('rating', String(minRating));

    const qs = params.toString();
    router.replace(qs ? `?${qs}` : '?');
  }, [page, limit, searchTerm, sortBy, priceRange, selectedCategories, selectedColors, selectedSizes, minRating, router]);

  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const result: PaginatedProductsResult = await getProductsPaginated({
          page,
          limit,
          sort: sortBy,
          search: searchTerm,
          category: selectedCategories[0],
          minPrice: priceRange[0] || undefined,
          maxPrice: priceRange[1] || undefined,
          colors: selectedColors,
          sizes: selectedSizes,
        });
        if (isMounted) {
          setProducts(result.items || []);
          setTotal(result.total || 0);
          setTotalPages(result.totalPages || 1);
        }
      } catch (error) {
        console.error("❌ Failed to fetch products:", error);
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
  }, [page, limit, searchTerm, sortBy, priceRange, selectedCategories, selectedColors, selectedSizes]);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">جاري تحميل المنتجات...</p>
          </div>
        </div>
      ) : (
        <ProductGrid
          products={products}
          useServerPagination
          serverPagination={{ page, limit, total, totalPages }}
          onPageChange={setPage}
          onPageSizeChange={(value) => {
            setPage(1);
            setLimit(value);
          }}
          filters={{
            searchTerm,
            sortBy,
            priceRange,
            selectedCategories,
            selectedColors,
            selectedSizes,
            minRating
          }}
          onFiltersChange={(next) => {
            setPage(1);
            setSearchTerm(next.searchTerm);
            setSortBy(next.sortBy);
            setPriceRange(next.priceRange);
            setSelectedCategories(next.selectedCategories);
            setSelectedColors(next.selectedColors);
            setSelectedSizes(next.selectedSizes);
            setMinRating(next.minRating);
          }}
        />
      )}
    </div>
  );
}
