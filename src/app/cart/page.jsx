'use client';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { MinusCircle, PlusCircle, Trash, ShoppingBag, ArrowCircleLeft, Lightning, ArrowUpRight } from 'phosphor-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import CountdownTimer from '@/components/CountdownTimer';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, loadingItems } = useCart();
  const router = useRouter();
  const [hasAddress, setHasAddress] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(price);
  };

  useEffect(() => {
    const checkUserAddress = async () => {
      try {
        const response = await fetch('/api/user/check-address', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        const data = await response.json();
        setHasAddress(data.hasAddress);
      } catch (error) {
        console.error('Error checking address:', error);
        setHasAddress(false);
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
    if (!hasAddress) {
      router.push('/profile/edit?redirect=checkout');
    } else {
      router.push('/checkout');
    }
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
  const discount = subtotal * 0.30; // 30% discount (for display only)
  const shippingOriginal = 40;
  const shippingDiscount = 40; // $40 off shipping
  const total = subtotal; // Keep the actual total unchanged

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-6">
          <div className="h-32 w-32 mx-auto rounded-full bg-gray-50 flex items-center justify-center">
            <ShoppingBag size={48} className="text-gray-400" />
          </div>
          <div className="max-w-[280px] space-y-3">
            <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
            <p className="text-gray-500">Looks like you haven't added anything to your cart yet.</p>
          </div>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#53D695] text-white font-medium 
              rounded-full hover:bg-[#53D695]/90 transition-all duration-200 group"
          >
            Continue Shopping
            <ArrowUpRight 
              weight="bold"
              className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" 
            />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-24 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between py-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Shopping Cart ({cart.length})
        </h1>
        <Link 
          href="/"
          className="hidden sm:flex items-center gap-2 text-[#53D695] font-medium hover:opacity-80 transition-opacity"
        >
          <ArrowCircleLeft weight="bold" />
          Continue Shopping
        </Link>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-8 space-y-4">
          {cart.map((item) => (
            <div 
              key={`${item.id}-${item.size}-${item.color}`}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
            >
              <div className="p-4">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <Link 
                    href={`/product/${item.id}`}
                    className="relative h-24 w-24 sm:h-32 sm:w-32 flex-shrink-0 rounded-xl overflow-hidden group"
                  >
                    <Image
                      src={item.images && item.images.length > 0 && item.images[0].url 
                        ? item.images[0].url 
                        : '/placeholder-product.png'}
                      alt={item.name || 'Product image'}
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
                          className="font-medium text-gray-900 hover:text-[#53D695] transition-colors line-clamp-2"
                        >
                          {item.name}
                        </Link>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {item.size && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-gray-50 text-sm text-gray-600">
                              Size: {item.size}
                            </span>
                          )}
                          {item.color && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-gray-50 text-sm text-gray-600">
                              Color: {item.color}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id, item.size, item.color)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg 
                          hover:bg-red-50 h-fit hover:shadow-sm"
                      >
                        <Trash size={20} />
                      </button>
                    </div>

                    {/* Quantity and Price */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-1 p-1 bg-gray-50 rounded-lg">
                        <button 
                          className="p-2 text-gray-400 hover:text-[#53D695] transition-colors"
                          onClick={() => updateQuantity(item.id, item.size, item.color, Math.max(1, (item.quantity || 1) - 1))}
                          disabled={(item.quantity || 1) <= 1 || loadingItems.has(`${item.id}-${item.size}-${item.color}`)}
                        >
                          <MinusCircle size={18} weight="bold" />
                        </button>
                        <span className="w-10 text-center font-medium">
                          {loadingItems.has(`${item.id}-${item.size}-${item.color}`) ? (
                            <div className="w-4 h-4 border-2 border-[#53D695] border-t-transparent rounded-full animate-spin mx-auto" />
                          ) : (
                            item.quantity || 1
                          )}
                        </span>
                        <button 
                          className="p-2 text-gray-400 hover:text-[#53D695] transition-colors"
                          onClick={() => updateQuantity(item.id, item.size, item.color, (item.quantity || 1) + 1)}
                          disabled={loadingItems.has(`${item.id}-${item.size}-${item.color}`)}
                        >
                          <PlusCircle size={18} weight="bold" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {formatPrice(item.price * (item.quantity || 1))}
                        </p>
                        <p className="text-sm text-gray-500 line-through">
                          {formatPrice(item.price * 1.3 * (item.quantity || 1))}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-4">
          <div className="sticky top-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Discount (30% off)</span>
                <span className="text-green-600 font-medium">-{formatPrice(discount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="border-t border-gray-100 my-4"></div>
              <div className="flex justify-between items-end">
                <span className="font-medium text-gray-900">Total</span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-gray-900">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>
            </div>
            <button 
              onClick={handleCheckout}
              className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-4 bg-[#53D695] text-white 
                font-medium rounded-xl hover:bg-[#53D695]/90 transition-all duration-200 group"
            >
              <Lightning 
                weight="fill"
                className="transition-transform duration-200 group-hover:scale-110" 
              />
              Proceed to Checkout
            </button>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500 mb-2">
                Limited time offer :
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 rounded-full">
                <CountdownTimer className="text-red-600 font-medium" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
