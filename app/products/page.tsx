'use client'; // Mark this component as a Client Component

import ProductGrid from '@/components/ProductGrid';
import { getProductsPaginated, PaginatedProductsResult } from '@/lib/api';
import { useCallback, useEffect, useRef, useState } from 'react';
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

  // Debounced search term for API calls and URL updates
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const isInitialMount = useRef(true);

  // Read URL params only on initial mount
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
    if (typeof qs === 'string') {
      setSearchTerm(qs);
      setDebouncedSearchTerm(qs);
    }
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

  // Debounce search term - only update debouncedSearchTerm after 500ms of no typing
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm]);

  // Update URL only on debounced values (not on every keystroke)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const params = new URLSearchParams();
    if (page > 1) params.set('page', String(page));
    if (limit !== 20) params.set('limit', String(limit));
    if (debouncedSearchTerm) params.set('search', debouncedSearchTerm);
    if (sortBy && sortBy !== 'newest') params.set('sort', sortBy);
    if (priceRange[0] > 0) params.set('minPrice', String(priceRange[0]));
    if (priceRange[1] > 0) params.set('maxPrice', String(priceRange[1]));
    if (selectedCategories.length) params.set('categories', selectedCategories.join(','));
    if (selectedColors.length) params.set('colors', selectedColors.join(','));
    if (selectedSizes.length) params.set('sizes', selectedSizes.join(','));
    if (minRating > 0) params.set('rating', String(minRating));

    const qs = params.toString();
    router.replace(qs ? `?${qs}` : '?', { scroll: false });
  }, [page, limit, debouncedSearchTerm, sortBy, priceRange, selectedCategories, selectedColors, selectedSizes, minRating, router]);

  // Fetch products only when debounced search term changes (not on every keystroke)
  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const result: PaginatedProductsResult = await getProductsPaginated({
          page,
          limit,
          sort: sortBy,
          search: debouncedSearchTerm,
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
  }, [page, limit, debouncedSearchTerm, sortBy, priceRange, selectedCategories, selectedColors, selectedSizes]);

  // Stable callback to avoid re-creating on every render
  const handleFiltersChange = useCallback((next: {
    searchTerm: string;
    sortBy: 'newest' | 'price-low' | 'price-high' | 'rating' | 'name';
    priceRange: [number, number];
    selectedCategories: string[];
    selectedColors: string[];
    selectedSizes: string[];
    minRating: number;
  }) => {
    setPage(1);
    setSearchTerm(next.searchTerm);
    setSortBy(next.sortBy);
    setPriceRange(next.priceRange);
    setSelectedCategories(next.selectedCategories);
    setSelectedColors(next.selectedColors);
    setSelectedSizes(next.selectedSizes);
    setMinRating(next.minRating);
  }, []);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <ProductGrid
        products={products}
        isExternalLoading={isLoading}
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
        onFiltersChange={handleFiltersChange}
      />
    </div>
  );
}
