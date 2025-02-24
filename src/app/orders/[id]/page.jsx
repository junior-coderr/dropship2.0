'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { CaretLeft, Package, MapPin, Clock, Money, X } from 'phosphor-react';
import { use } from 'react';
import { usePopup } from '@/context/PopupContext';

export default function OrderDetailPage({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const { showPopup } = usePopup();

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

        {/* Order Items */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-4">
            <h2 className="font-medium text-gray-900 mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item._id} className="flex gap-4">
                  <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={item.productId?.images?.[0]?.url || '/placeholder-product.png'} // Add fallback image
                      alt={item.productId?.name || 'Product image'}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.productId?.name}</h3>
                    <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                      <span>Qty: {item.quantity}</span>
                      {item.size && <span>Size: {item.size}</span>}
                      {item.color && <span>Color: {item.color}</span>}
                    </div>
                    <div className="mt-2 font-medium text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={20} className="text-gray-500" />
            <h2 className="font-medium text-gray-900">Shipping Address</h2>
          </div>
          <div className="text-sm text-gray-500 space-y-1">
            <p>{order.shippingAddress.street}</p>
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
              <span className="text-gray-900">${order.totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Shipping</span>
              <span className="text-green-600 font-medium">Free</span>
            </div>
            <div className="border-t border-gray-100 pt-3">
              <div className="flex justify-between">
                <span className="font-medium text-gray-900">Total</span>
                <span className="font-bold text-gray-900">
                  ${order.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
