'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { ShoppingBag, User, Package, SignOut, List, Heart } from 'phosphor-react';

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { cart } = useCart();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsDropdownOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="container mx-auto px-4 py-2.5">
        <div className="flex items-center justify-between">
          {/* Logo section */}
          <Link href="/" className="flex items-center gap-1.5 group">
            <Heart 
              weight="fill" 
              className="w-5 h-5 text-[#53D695] transform -rotate-12 group-hover:scale-110 transition-transform duration-200" 
            />
            <div className="flex flex-col -space-y-0.5">
              <span className="text-xl font-bold text-gray-800 tracking-tight font-sora  transition-colors duration-200">
                cupidcart
              </span>
              <span className="text-[0.6rem] tracking-[0.15em] text-[#53D695] uppercase font-dm-sans font-bold ml-[0.1em]">
                .in
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-5">
            {/* Cart icon - only visible on desktop */}
            <Link 
              href="/cart" 
              className="relative p-2.5 hover:bg-gray-50 rounded-full transition-all duration-200 group hidden sm:block"
            >
              <ShoppingBag 
                size={24} 
                weight="regular"
                className="text-gray-700 transition-transform duration-200 group-hover:scale-110 group-hover:text-[#53D695]" 
              />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#53D695] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium animate-in shadow-sm">
                  {cart.length}
                </span>
              )}
            </Link>


            {/* User menu */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="p-2.5 hover:bg-gray-50 rounded-full transition-all duration-200 group"
              >
                <User 
                  size={24} 
                  weight="regular"
                  className="text-gray-700 transition-transform duration-200 group-hover:scale-110 group-hover:text-[#53D695]" 
                />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 animate-in fade-in slide-in-from-top-5">
                  {/* Desktop Menu Items */}
                  <div className="hidden sm:block">
                    <Link
                      href="/orders"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Package size={18} />
                      Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <SignOut size={18} />
                      Logout
                    </button>
                  </div>

                  {/* Mobile Menu Items */}
                  <div className="sm:hidden">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <SignOut size={18} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
