'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { CaretLeft, Package, MapPin, Clock, Money, X, ArrowCounterClockwise } from 'phosphor-react';
import { use } from 'react';
import { usePopup } from '@/context/PopupContext';
import ReturnRequestForm from '@/components/ReturnRequestForm';
// import Link from 'next/link';

export default function OrderDetailPage({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const { showPopup } = usePopup();
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`/api/orders/${resolvedParams.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setOrder(data.order);
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [resolvedParams.id]);

  // Check if order is eligible for return (delivered within the last 7 days)
  const isEligibleForReturn = () => {
    // If order doesn't exist, isn't delivered, or doesn't have deliveredAt timestamp, it's not eligible
    if (!order || order.status !== 'delivered' || !order.deliveredAt) {
      return false;
    }
    
    const deliveredDate = new Date(order.deliveredAt);
    const currentDate = new Date();
    const daysSinceDelivery = Math.floor((currentDate - deliveredDate) / (1000 * 60 * 60 * 24));
    
    // Only allow returns within 7 days of delivery
    return daysSinceDelivery <= 7;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCancelOrder = async () => {
    showPopup({
      title: 'Cancel Order',
      message: 'Are you sure you want to cancel this order? This action cannot be undone.',
      type: 'danger',
      confirmText: 'Yes, Cancel Order',
      onConfirm: async () => {
        setCancelling(true);
        try {
          const response = await fetch(`/api/orders/${resolvedParams.id}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
          });
          const data = await response.json();
          if (data.success) {
            setOrder(data.order);
          } else {
            throw new Error(data.error || 'Failed to cancel order');
          }
        } catch (error) {
          console.error('Error cancelling order:', error);
          showPopup({
            title: 'Error',
            message: 'Failed to cancel order: ' + error.message,
            type: 'danger',
            confirmText: 'OK',
            onConfirm: () => {}
          });
        } finally {
          setCancelling(false);
        }
      }
    });
  };

  const handleReturnRequest = (item) => {
    // Show popup with fee notice before proceeding to return form
    showPopup({
      title: 'Return Fee Notice',
      message: 'Please note that a 40% restocking fee will be charged on all returns. This means you will receive 60% of the item price as refund. Do you wish to proceed?',
      type: 'warning',
      confirmText: 'Proceed with Return',
      cancelText: 'Cancel',
      onConfirm: () => {
        setSelectedItem(item);
        setShowReturnForm(true);
      }
    });
  };

  const handleReturnSuccess = () => {
    // Refresh the order details to show the return request
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`/api/orders/${resolvedParams.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setOrder(data.order);
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
      }
    };
    fetchOrderDetails();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center">
          <h2 className="text-lg font-medium text-gray-900">Order not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Return Form Modal */}
      {showReturnForm && selectedItem && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full">
            <ReturnRequestForm 
              orderId={order._id} 
              item={selectedItem} 
              onClose={() => {
                setShowReturnForm(false);
                setSelectedItem(null);
              }}
              onSuccess={handleReturnSuccess}
            />
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => router.back()}
          className="p-2.5 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <CaretLeft weight="bold" size={20} className="text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">
          Order #{order._id.slice(-6)}
        </h1>
      </div>
      
      <div className="space-y-6">
        {/* Return eligibility notice - New prominent banner */}
        {isEligibleForReturn() && (
          <div className="bg-green-50 border border-green-100 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="bg-green-100 rounded-full p-2 mt-1">
                <ArrowCounterClockwise size={20} className="text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-green-800">Returns Available</h3>
                <p className="text-sm text-green-700 mt-1">
                  This order is eligible for returns until {new Date(new Date(order.deliveredAt).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}.
                  Select an item below to request a return.
                </p>
                {/* <p className="text-xs text-orange-600 font-medium mt-1">
                  Note: 40% restocking fee will be charged on all returns.
                </p> */}
              </div>
            </div>
          </div>
        )}
        
        {/* Order Status */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Package size={20} className="text-gray-500" />
              <span className="font-medium text-gray-900">Order Status</span>
            </div>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock size={16} />
              <span>Ordered on {new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex gap-3">
              {/* {isEligibleForReturn() && (
                <Link
                  href="/returns"
                  className="flex items-center flex-wrap gap-1 px-0 py-1.5 text-sm font-medium text-[#53D695] hover:text-[#43C685]"
                >
                  <ArrowCounterClockwise size={16} />
                  View All Returns
                </Link>
              )}
               */}
              {['pending', 'confirmed'].includes(order.status) && (
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="flex items-center flex-wrap gap-1 px-0 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                >
                  <X size={16} />
                  {cancelling ? 'Cancelling...' : 'Cancel Order'}
                </button>
              )}
            </div>
          </div>
          
          {order.deliveredAt && (
            <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
              <Clock size={16} />
              <span>Delivered on {new Date(order.deliveredAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>
        
        {/* Order Items */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-medium text-gray-900">Order Items</h2>
              
              {isEligibleForReturn() && (
                <div className="text-xs font-medium text-blue-600 flex items-center">
                  <ArrowCounterClockwise size={14} className="mr-1" />
                  Items are eligible for return
                </div>
              )}
            </div>
            
            <div className="space-y-5">
              {order.items.map((item) => (
                <div key={item._id} className={`flex gap-4 p-3 rounded-lg ${isEligibleForReturn() && !item.returnRequest ? 'bg-blue-50/30 border border-blue-100' : ''}`}>
                  <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={item.productId?.images?.[0]?.url || '/placeholder-product.png'} // Add fallback image
                      alt={item.productId?.name || 'Product image'}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between flex-col">
                      <h3 className="font-medium text-gray-900">{item.productId?.name}</h3>
                      
                      {/* Return Status */}
                      
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                      <span>Qty: {item.quantity}</span>
                      {item.size && <span>Size: {item.size}</span>}
                      {item.color && <span>Color: {item.color}</span>}
                    </div>
                    <div className="flex justify-between mt-2">
                      <div className="font-medium text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                      
                      
                      {/* Return Button */}
                      {isEligibleForReturn() && !item.returnRequest && (
                        <button 
                          onClick={() => handleReturnRequest(item)}
                          className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md flex items-center gap-1 transition-colors"
                        >
                          <ArrowCounterClockwise size={14} />
                          Return Item
                        </button>
                      )}
                    </div>
                    {item.returnRequest && (
                        <div className="text-xs px-2 py-2 my-1 rounded-full bg-blue-100 text-blue-700 font-medium flex items-center">
                          <ArrowCounterClockwise size={12} className="mr-1" />
                          Return {item.returnRequest.status}
                        </div>
                      )}
                    
                    {/* Return Request Details */}
                    {item.returnRequest && (
                      <div className="mt-3 bg-blue-50 p-2 rounded-md text-xs">
                        <div className="flex justify-between items-center text-blue-800">
                          <span className="font-medium">Return Request Details</span>
                          <span>{new Date(item.returnRequest.requestedAt).toLocaleDateString()}</span>
                        </div>
                        <p className="mt-1 text-blue-700">
                          UPI ID: {item.returnRequest.upiId}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Return Instructions - New section */}
        {isEligibleForReturn() && (
          <div className="bg-white rounded-xl border border-blue-100 p-4">
            <div className="flex items-center gap-2 mb-3 text-blue-700">
              <ArrowCounterClockwise size={18} />
              <h2 className="font-medium">Return Policy</h2>
            </div>
            <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
              <li>Items can be returned within 7 days of delivery</li>
              {/* <li><span className="font-medium text-orange-600">A 40% restocking fee will be charged on all returns</span></li> */}
              <li>Provide a valid UPI ID for refund processing</li>
              <li>Refunds are typically processed within 5-7 business days after return approval</li>
              <li>Items should be in original condition with tags and packaging</li>
            </ul>
          </div>
        )}
        
        {/* Shipping Address */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={20} className="text-gray-500" />
            <h2 className="font-medium text-gray-900">Shipping Address</h2>
          </div>
          <div className="text-sm text-gray-500 space-y-1">
            <p>{order.shippingAddress.houseNumber} {order.shippingAddress.roadName}</p>
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
            </p>
          </div>
        </div>
        
        {/* Payment Details */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Money size={20} className="text-gray-500" />
            <h2 className="font-medium text-gray-900">Payment Details</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Payment Method</span>
              <span className="text-gray-900">
                {order.paymentMethod.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-900">{formatPrice(order.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Shipping</span>
              <span className="text-green-600 font-medium">Free</span>
            </div>
            <div className="border-t border-gray-100 pt-3">
              <div className="flex justify-between">
                <span className="font-medium text-gray-900">Total</span>
                <span className="font-bold text-gray-900">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
