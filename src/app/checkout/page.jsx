'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CaretLeft, MapPin, CreditCard, Money, CheckCircle, Truck, ArrowsClockwise } from 'phosphor-react';
import { useCart } from '@/context/CartContext';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('cod');
  
  const total = cart.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);

  const handleConfirmOrder = () => {
    // Handle order confirmation
    // You can add order processing logic here
    router.push('/orders');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => router.back()}
          className="p-2.5 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <CaretLeft weight="bold" size={20} className="text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
      </div>

      <div className="space-y-6">
        {/* Delivery Address */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex gap-3">
                <div className="p-2 rounded-lg bg-[#53D695]/10">
                  <MapPin weight="bold" size={20} className="text-[#53D695]" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Delivery Address</h3>
                  <div className="mt-2 space-y-1 text-sm text-gray-500">
                    <p>John Doe</p>
                    <p>+1 234 567 8900</p>
                    <p>123 Street Name, City, State, 12345</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => router.push('/profile/edit')}
                className="text-[#53D695] text-sm font-medium hover:underline"
              >
                Change
              </button>
            </div>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="grid grid-cols-2 gap-4">
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

        {/* Payment Method */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-4">
            <div className="flex gap-3">
              <div className="p-2 rounded-lg bg-[#53D695]/10">
                <CreditCard weight="bold" size={20} className="text-[#53D695]" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-3">Payment Method</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-[#53D695] focus:ring-[#53D695] h-4 w-4"
                    />
                    <div className="flex items-center gap-2">
                      <Money weight="bold" size={20} className="text-[#53D695]" />
                      <span className="font-medium text-gray-900">Cash on Delivery</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-4">
            <h3 className="font-medium text-gray-900 mb-3">Order Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="border-t border-gray-100 my-3"></div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-900">Total</span>
                <span className="font-bold text-gray-900">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Confirm Order Button */}
        <button
          onClick={handleConfirmOrder}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#53D695] text-white font-medium rounded-full hover:bg-[#53D695]/90 transition-colors group"
        >
          <CheckCircle 
            weight="fill" 
            size={20} 
            className="transition-transform group-hover:scale-110" 
          />
          Confirm Order
        </button>

        <p className="text-xs text-center text-gray-500">
          By confirming your order, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
