'use client';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import { ShoppingCart } from 'phosphor-react';
import Link from 'next/link';

const products = [
  {
    id: 1,
    name: 'Wireless Headphones',
    price: 99.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
    description: 'Premium wireless headphones with noise cancellation',
    isNew: true,
    rating: 4.5
  },
  {
    id: 2,
    name: 'Smart Watch',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
    description: 'Feature-rich smartwatch with health tracking',
    isNew: false,
    rating: 4.0
  },
  {
    id: 3,
    name: 'Digital Camera',
    price: 499.99,
    image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f',
    description: 'Professional grade digital camera',
    isNew: false,
    rating: 4.8
  },
  {
    id: 4,
    name: 'Laptop',
    price: 899.99,
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853',
    description: 'High-performance laptop for professionals',
    isNew: true,
    rating: 4.7
  },
  {
    id: 5,
    name: 'Smartphone',
    price: 699.99,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9',
    description: 'Latest generation smartphone',
    isNew: false,
    rating: 4.3
  },
  {
    id: 6,
    name: 'Wireless Earbuds',
    price: 149.99,
    image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb',
    description: 'Premium wireless earbuds with charging case',
    isNew: true,
    rating: 4.6
  }
];

export default function ProductGrid() {
  const { addToCart } = useCart();
  const formatPrice = (price) => `$${price.toFixed(2)}`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      {products.map((product) => (
        <Link href={`/product/${product.id}`}
          key={product.id} 
          className="group bg-white/70 backdrop-blur-sm rounded-[2rem] 
            shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]
            transition-all duration-300 relative overflow-hidden border border-gray-100
            hover:border-gray-200"
        >
          {/* Image Container */}
          <div className="relative h-72 overflow-hidden rounded-t-[2rem] bg-gray-50">
            <Image 
              src={product.image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {product.isNew && (
              <span className="absolute top-4 left-4 bg-[#38D49A]/90 backdrop-blur-md 
                text-white px-3 py-1 rounded-full text-xs font-semibold
                shadow-[0_2px_10px_rgb(56,212,154,0.3)]">
                Bestseller
              </span>
            )}
          </div>

          {/* Content */}
          <div className="p-6 relative backdrop-blur-sm">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900 mb-2 drop-shadow-sm">
                {product.name}
              </h3>
              <p className="text-sm text-gray-500 line-clamp-2 font-medium">
                {product.description}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xl font-extrabold text-gray-900 drop-shadow-sm">
                {formatPrice(product.price)}
              </p>

              <button
                onClick={() => addToCart(product)}
                className="flex items-center gap-2 bg-[#38D49A] text-white px-5 py-2.5 rounded-full
                  text-sm font-semibold transition-all duration-300
                  shadow-[0_4px_10px_rgb(56,212,154,0.2)]
                  hover:shadow-[0_6px_20px_rgb(56,212,154,0.35)]
                  hover:translate-y-[-2px]"
              >
                <ShoppingCart size={18} weight="bold" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
