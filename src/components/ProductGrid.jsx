'use client';
import { useProducts } from '@/hooks/useProducts';
import { useImageValidation } from '@/hooks/useImageValidation';
import Image from 'next/image';
import { ArrowUpRight } from 'phosphor-react';
import Link from 'next/link';
import { useMemo, useEffect } from 'react';

const DEFAULT_PLACEHOLDER = '/placeholder.png';

// Fisher-Yates shuffle algorithm
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const ProductImage = ({ product }) => {
  const imageUrl = product.images[0]?.url || null;
  const validatedSrc = useImageValidation(imageUrl, DEFAULT_PLACEHOLDER);

  if (!validatedSrc) {
    return null;
  }

  return (
    <Image 
      src={validatedSrc}
      alt={product?.name || 'Product image'}
      fill
      className="object-cover group-hover:scale-105 transition-transform duration-500"
      priority={false}
      unoptimized={validatedSrc === DEFAULT_PLACEHOLDER}
    />
  );
};

export default function ProductGrid() {
  const { products, loading, error } = useProducts();
  
  // Memoize the shuffled products array with localStorage persistence
  const shuffledProducts = useMemo(() => {
    if (typeof window === 'undefined' || !products) return [];
    
    // Try to get existing order from localStorage
    const storedOrder = localStorage.getItem('productsOrder');
    if (storedOrder) {
      try {
        const orderMap = JSON.parse(storedOrder);
        // Check if stored order is still valid for current products
        const isValidOrder = products.every(p => p._id in orderMap);
        if (isValidOrder) {
          return [...products].sort((a, b) => orderMap[a._id] - orderMap[b._id]);
        }
      } catch (e) {
        console.error('Error parsing stored products order:', e);
      }
    }
    
    // If no valid stored order, create new shuffle
    const shuffled = shuffleArray([...products]);
    // Store new order
    const newOrder = Object.fromEntries(
      shuffled.map((p, index) => [p._id, index])
    );
    localStorage.setItem('productsOrder', JSON.stringify(newOrder));
    return shuffled;
  }, [products]);

  // Restore scroll position when navigating back
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const scrollPosition = sessionStorage.getItem('scrollPosition');
      if (scrollPosition) {
        window.scrollTo(0, parseInt(scrollPosition));
        sessionStorage.removeItem('scrollPosition');
      }
    }
  }, []);

  const handleProductClick = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('scrollPosition', window.scrollY.toString());
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(price);
  };

  const calculateOriginalPrice = (price) => price * 1.3;

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 h-72 rounded-[2rem]"></div>
            <div className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-10">
        Error loading products: {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      {shuffledProducts.map((product) => (
        <Link 
          href={`/product/${product._id}`}
          key={product._id} 
          onClick={handleProductClick}
          className="group bg-white/70 backdrop-blur-sm rounded-[2rem] 
            shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]
            transition-all duration-300 relative overflow-hidden border border-gray-200
            hover:border-gray-300"
        >
          {/* Image Container */}
          <div className="relative h-72 overflow-hidden rounded-t-[2rem] bg-gray-50">
            <ProductImage product={product} />
            <div className="absolute top-4 left-4 flex gap-2">
              {product.isNew && (
                <span className="bg-[#38D49A]/90 backdrop-blur-md 
                  text-white px-3 py-1 rounded-full text-xs font-semibold
                  shadow-[0_2px_10px_rgb(56,212,154,0.3)]">
                  Bestseller
                </span>
              )}
              <span className="bg-red-500/90 backdrop-blur-md 
                text-white px-3 py-1 rounded-full text-xs font-semibold
                shadow-[0_2px_10px_rgb(239,68,68,0.3)]">
                30% OFF
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 relative backdrop-blur-sm">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900 mb-2 drop-shadow-sm line-clamp-2 min-h-[3.5rem]">
                {product.name}
              </h3>
              <p className="text-sm text-gray-500 line-clamp-1 font-medium">
                {product.description}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <p className="text-xl font-extrabold text-gray-900 drop-shadow-sm">
                  {formatPrice(product.price)}
                </p>
                <p className="text-sm text-gray-500 line-through">
                  {formatPrice(calculateOriginalPrice(product.price))}
                </p>
              </div>
              <div className="p-2 bg-black/90 backdrop-blur-sm rounded-full text-[#fff]">
                <ArrowUpRight size={20} weight="bold" />
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
