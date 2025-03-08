'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { House, Package, ShoppingBag } from 'phosphor-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function MobileNav() {
  const pathname = usePathname();
  const { cart } = useCart();
  const { user } = useAuth();
  
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 sm:hidden">
      <div className="flex items-center gap-6 px-6 py-4 bg-white/95 backdrop-blur-md rounded-full shadow-lg border border-gray-100/50">
        <Link 
          href="/cart" 
          className={`relative transition-all duration-300 ease-in-out active:scale-90 p-2.5 rounded-full ${
            pathname === '/cart' 
              ? 'text-[#53D695] bg-[#53D695]/10' 
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
          }`}
        >
          <ShoppingBag 
            size={24} 
            weight={pathname === '/cart' ? 'fill' : 'regular'} 
            className="transition-all duration-300 ease-in-out"
          />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#53D695] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium animate-in shadow-sm">
              {cart.length}
            </span>
          )}
        </Link>
        
        <Link 
          href="/" 
          className={`relative transition-all duration-300 ease-in-out active:scale-90 p-2.5 rounded-full ${
            pathname === '/' 
              ? 'text-[#53D695] bg-[#53D695]/10' 
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
          }`}
        >
          <House 
            size={24} 
            weight={pathname === '/' ? 'fill' : 'regular'}
            className="transition-all duration-300 ease-in-out"
          />
        </Link>
        
        <Link 
          href="/orders" 
          className={`relative transition-all duration-300 ease-in-out active:scale-90 p-2.5 rounded-full ${
            pathname === '/orders' || pathname.startsWith('/orders/') 
              ? 'text-[#53D695] bg-[#53D695]/10' 
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Package 
            size={24} 
            weight={pathname === '/orders' || pathname.startsWith('/orders/') ? 'fill' : 'regular'}
            className="transition-all duration-300 ease-in-out"
          />
        </Link>
      </div>
    </div>
  );
}
