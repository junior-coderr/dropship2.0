'use client';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { MinusCircle, PlusCircle, Trash, ShoppingBag, ArrowCircleLeft, Truck, ArrowsClockwise } from 'phosphor-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import CountdownTimer from '@/components/CountdownTimer';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, loadingItems } = useCart();
  const router = useRouter();
  const [hasAddress, setHasAddress] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    // Check if user has address (you'll need to implement this API endpoint)
    const checkUserAddress = async () => {
      try {
        const response = await fetch('/api/user/check-address',{
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        const data = await response.json();
        setHasAddress(Boolean(data.hasAddress));
      } catch (error) {
        console.error('Error checking address:', error);
      }
    };

    checkUserAddress();
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setUserProfile(data.user);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleCheckout = () => {
    if (!userProfile?.address?.street) {
      router.push('/profile/edit?redirect=checkout');
    } else {
      router.push('/checkout');
    }
  };

  const total = cart.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="h-40 w-40 rounded-full bg-gray-50 flex items-center justify-center">
          <ShoppingBag size={48} className="text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
        <p className="text-gray-500">Add some items to your cart to see them here.</p>
        <Link 
          href="/"
          className="mt-4 px-6 py-3 bg-[#53D695] text-white font-medium rounded-full hover:bg-[#53D695]/90 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Shopping Cart ({cart.length} items)
        </h1>
        <Link 
          href="/"
          className="hidden sm:flex items-center gap-2 text-sm text-[#53D695] font-medium hover:opacity-80 transition-opacity"
        >
          <ArrowCircleLeft size={20} weight="bold" />
          Continue Shopping
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div 
              key={`${item.id}-${item.size}-${item.color}`}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-gray-200 transition-colors"
            >
              <div className="p-4">
                <div className="flex gap-3 sm:gap-4">
                  {/* Product Image */}
                  {console.log('item', item)}
                  <Link 
                    href={`/product/${item.id}`}
                    className="relative h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 rounded-lg overflow-hidden group"
                  >
                    <Image
                      src={item?.images[0].url}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </Link>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex justify-between gap-2">
                      <div>
                        <Link 
                          href={`/product/${item.id}`}
                          className="font-medium text-gray-900 hover:text-[#53D695] transition-colors line-clamp-1 sm:line-clamp-2"
                        >
                          {item.name}
                        </Link>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {item.size && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-50 text-xs text-gray-600">
                              Size: {item.size}
                            </span>
                          )}
                          {item.color && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-50 text-xs text-gray-600">
                              Color: {item.color}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id, item.size, item.color)}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 h-fit"
                      >
                        <Trash size={18} />
                      </button>
                    </div>

                    {/* Quantity and Price */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1 p-1 bg-gray-50 rounded-lg">
                        <button 
                          className="p-1.5 text-gray-400 hover:text-[#53D695] transition-colors disabled:opacity-50"
                          onClick={() => updateQuantity(item.id, item.size, item.color, Math.max(1, (item.quantity || 1) - 1))}
                          disabled={(item.quantity || 1) <= 1 || loadingItems.has(`${item.id}-${item.size}-${item.color}`)}
                        >
                          <MinusCircle size={16} weight="bold" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">
                          {loadingItems.has(`${item.id}-${item.size}-${item.color}`) ? (
                            <div className="w-4 h-4 border-2 border-[#53D695] border-t-transparent rounded-full animate-spin mx-auto" />
                          ) : (
                            item.quantity || 1
                          )}
                        </span>
                        <button 
                          className="p-1.5 text-gray-400 hover:text-[#53D695] transition-colors"
                          onClick={() => updateQuantity(item.id, item.size, item.color, (item.quantity || 1) + 1)}
                          disabled={loadingItems.has(`${item.id}-${item.size}-${item.color}`)}
                        >
                          <PlusCircle size={16} weight="bold" />
                        </button>
                      </div>
                      <p className="font-bold text-gray-900">
                        ${(item.price * (item.quantity || 1)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Updated Delivery Details with estimated time */}
          <div className="mt-6 bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">Delivery Details</h3>
                  {loadingProfile ? (
                    <div className="animate-pulse space-y-2 mt-2">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-4 bg-gray-200 rounded w-48"></div>
                    </div>
                  ) : userProfile ? (
                    <div className="mt-2 space-y-1 text-sm text-gray-500">
                      <p>{userProfile.name}</p>
                      <p>{userProfile.phone}</p>
                      <p>
                        {userProfile.address?.street}, 
                        {userProfile.address?.city}, 
                        {userProfile.address?.state} {userProfile.address?.zipCode}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-gray-500">No address information available</p>
                  )}
                  <div className="flex flex-wrap gap-1">
                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                      <div className="p-4">
                        <div className="flex gap-3 items-start">
                          <div className="p-2 rounded-lg bg-[#53D695]/10">
                            <Truck weight="bold" size={20} className="text-[#53D695]" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">Free Delivery</h3>
                            <p className="mt-1 text-sm text-[#53D695] font-medium">
                              Estimated 8-10 business days
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => router.push('/profile/edit')}
                  className="text-[#53D695] text-sm font-medium hover:underline"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="sticky top-20 h-fit bg-white p-5 rounded-xl border border-gray-100 shadow-sm lg:top-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-900">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Shipping</span>
              <span className="text-green-600 font-medium">Free</span>
            </div>
            <div className="border-t border-gray-100 my-4"></div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-900">Total</span>
              <span className="font-bold text-gray-900">${total.toFixed(2)}</span>
            </div>
          </div>
          <button 
            onClick={handleCheckout}
            className="w-full mt-6 px-6 py-3.5 bg-[#53D695] text-white font-medium rounded-full hover:bg-[#53D695]/90 transition-colors"
          >
            Proceed to Checkout
          </button>
          <div className="mt-3 text-center">
            <p className="text-sm text-gray-500 mb-2">
              Free delivery ends in:
            </p>
            <CountdownTimer />
          </div>
        </div>
      </div>
    </div>
  );
}
