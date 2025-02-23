'use client';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import ProductCard from './ProductCard';
import { getProducts } from '@/lib/api/products';

export default function ProductsList({ initialData }) {
  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status
  } = useInfiniteQuery(
    ['products'],
    ({ pageParam = 1 }) => getProducts({ page: pageParam }),
    {
      getNextPageParam: (lastPage) => 
        lastPage.pagination.hasMore ? lastPage.pagination.current + 1 : undefined,
      initialData: {
        pages: [initialData],
        pageParams: [1]
      }
    }
  );

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage]);

  if (status === 'error') {
    return <div>Error loading products</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {data?.pages.map((page) =>
        page.products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))
      )}

      <div ref={ref} className="col-span-full h-10 flex items-center justify-center">
        {isFetchingNextPage && (
          <div className="loading-spinner" />
        )}
      </div>
    </div>
  );
}
