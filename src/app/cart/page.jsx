'use client';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { MinusCircle, PlusCircle, Trash, ShoppingBag, ArrowRight, Truck, ArrowsClockwise } from 'phosphor-react';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity } = useCart();
  const router = useRouter();

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
          className="hidden sm:flex items-center gap-1 text-sm text-[#53D695] font-medium hover:underline"
        >
          Continue Shopping
          <ArrowRight size={16} />
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
                  <Link 
                    href={`/product/${item.id}`}
                    className="relative h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 rounded-lg overflow-hidden group"
                  >
                    <Image
                      src={item.image}
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
                        onClick={() => removeFromCart(item.id)}
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
                          onClick={() => updateQuantity(item.id, item.size, item.color, (item.quantity || 1) - 1)}
                          disabled={(item.quantity || 1) <= 1}
                        >
                          <MinusCircle size={16} weight="bold" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity || 1}
                        </span>
                        <button 
                          className="p-1.5 text-gray-400 hover:text-[#53D695] transition-colors"
                          onClick={() => updateQuantity(item.id, item.size, item.color, (item.quantity || 1) + 1)}
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
                  <div className="mt-2 space-y-1 text-sm text-gray-500">
                    <p>John Doe</p>
                    <p>+1 234 567 8900</p>
                    <p>123 Street Name, City, State, 12345</p>
                    <br />
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
          <Link 
            href="/checkout"
            className="w-full mt-6 px-6 py-3.5 bg-[#53D695] text-white font-medium rounded-full hover:bg-[#53D695]/90 transition-colors inline-block text-center"
          >
            Proceed to Checkout
          </Link>
          <p className="mt-3 text-xs text-center text-gray-500">
            Free shipping on all orders over $50
          </p>
        </div>
      </div>
    </div>
  );
}
