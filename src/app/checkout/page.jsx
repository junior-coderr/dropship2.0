'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CaretLeft, MapPin, CreditCard, Money, CheckCircle, Truck } from 'phosphor-react';
import { useCart } from '@/context/CartContext';
import ReactConfetti from 'react-confetti';
import { toast } from 'react-hot-toast';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = cart.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
  const discount = subtotal * 0.30; // 30% discount (for display only)
  const shippingOriginal = 40;
  const shippingDiscount = 40; // ₹40 off shipping
  const total = subtotal; // Keep the actual total unchanged

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(price);
  };

  useEffect(() => {
    const checkAddressAndFetchProfile = async () => {
      try {
        // First check if user has address
        const addressResponse = await fetch('/api/user/check-address', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        const addressData = await addressResponse.json();
        
        if (!addressData.hasAddress) {
          router.replace('/profile/edit?redirect=checkout');
          return;
        }

        // Then fetch user profile
        const profileResponse = await fetch('/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        const profileData = await profileResponse.json();
        if (profileData.success) {
          setUserProfile(profileData.user);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoadingProfile(false);
      }
    };

    checkAddressAndFetchProfile();
  }, [router]);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleConfirmOrder = async () => {
    setIsSubmitting(true); // Start loading
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          paymentMethod
        })
      });

      const data = await response.json();
      if (data.success && data.order && data.order._id) {
        setShowConfetti(true);
        setTimeout(() => {
          router.push(`/orders/${data.order._id}`);
        }, 3000);
      } else {
        // Handle the case where order data is missing or incomplete
        setShowConfetti(true);
        setTimeout(() => {
          // Redirect to orders list instead of a specific order if no ID is available
          router.push('/orders');
        }, 3000);
        console.warn('Order created but ID unavailable:', data);
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred while placing your order');
      setIsSubmitting(false); // Stop loading on error
    }
  };

  return (
    <div className="relative">
      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <ReactConfetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={500}
            gravity={0.3}
            colors={['#53D695', '#4CAF50', '#8BC34A', '#CDDC39']}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center transform scale-up-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#53D695]/10 flex items-center justify-center">
                <CheckCircle weight="fill" size={32} className="text-[#53D695]" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Order Placed Successfully!
              </h2>
              <p className="text-gray-500">
                Redirecting you to order details...
              </p>
            </div>
          </div>
        </div>
      )}

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
                          {userProfile.address?.houseNumber}, {userProfile.address?.roadName}
                        </p>
                        <p>
                          {userProfile.address?.city}, {userProfile.address?.state} {userProfile.address?.zipCode}
                        </p>
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-gray-500">No address information available</p>
                    )}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"> {/* Changed grid-cols-2 to grid-cols-1 with sm: breakpoint */}
            <div className="w-full bg-white rounded-xl border border-gray-100 overflow-hidden"> {/* Added w-full */}
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
                  <span className="text-gray-900">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Discount (30% off)</span>
                  <span className="text-green-600 font-medium">-₹{discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <div className="text-right">
                    <span className="text-gray-500 line-through">₹{shippingOriginal.toFixed(2)}</span>
                    <span className="text-green-600 font-medium ml-2">Free</span>
                  </div>
                </div>
                <div className="border-t border-gray-100 my-3"></div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-900">Total</span>
                  <div className="text-right">
                    <span className="font-bold text-gray-900">
                      ₹{total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Confirm Order Button */}
          <button
            onClick={handleConfirmOrder}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#53D695] text-white font-medium rounded-full hover:bg-[#53D695]/90 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <CheckCircle 
                  weight="fill" 
                  size={20} 
                  className="transition-transform group-hover:scale-110" 
                />
                Confirm Order
              </>
            )}
          </button>
          {/* <p className="text-xs text-center text-gray-500 mt-2">
            By confirming your order, you agree to our <span  className="text-[#53D695] hover:underline">Terms and Conditions</span>
          </p> */}
        </div>
      </div>
    </div>
  );
}
