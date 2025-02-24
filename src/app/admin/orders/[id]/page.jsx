'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  CaretLeft, 
  Package, 
  MapPin, 
  User, 
  Calendar,
  Timer,
  Money,
  Truck,
  X,
  CheckCircle,
  CaretDown
} from 'phosphor-react';
import { usePopup } from '@/context/PopupContext';

export default function AdminOrderDetail({ params }) {
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showPopup } = usePopup();
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;
  const [showMoreUserInfo, setShowMoreUserInfo] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loadingUserData, setLoadingUserData] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`/api/admin/orders/${orderId}`, {
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
  }, [orderId]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          orderId: order._id,
          status: newStatus
        })
      });

      const data = await response.json();
      if (data.success) {
        setOrder(data.order);
        showPopup({
          title: 'Success',
          message: 'Order status updated successfully',
          type: 'success'
        });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      showPopup({
        title: 'Error',
        message: 'Failed to update order status',
        type: 'error'
      });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const fetchUserDetails = async () => {
    setLoadingUserData(true);
    try {
      const response = await fetch(`/api/admin/users/${order.userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setUserData(data.user);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoadingUserData(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-lg font-medium text-gray-900">Order not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
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
            <div className="flex flex-wrap gap-4">
              {['pending', 'confirmed', 'shipped', 'delivered'].includes(order.status) && (
                <>
                  {order.status !== 'delivered' && (
                    <button
                      onClick={() => handleStatusUpdate('cancelled')}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700"
                    >
                      <X size={16} />
                      Cancel Order
                    </button>
                  )}
                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleStatusUpdate('confirmed')}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      <CheckCircle size={16} />
                      Confirm Order
                    </button>
                  )}
                  {order.status === 'confirmed' && (
                    <button
                      onClick={() => handleStatusUpdate('shipped')}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-purple-600 hover:text-purple-700"
                    >
                      <Truck size={16} />
                      Mark as Shipped
                    </button>
                  )}
                  {order.status === 'shipped' && (
                    <button
                      onClick={() => handleStatusUpdate('delivered')}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-green-600 hover:text-green-700"
                    >
                      <CheckCircle size={16} />
                      Mark as Delivered
                    </button>
                  )}
                </>
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
                        src={item.productId?.images?.[0]?.url || '/placeholder.png'}
                        alt={item.productId?.name}
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
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info - Updated */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-4">
              <User size={20} className="text-gray-500" />
              <h2 className="font-medium text-gray-900">Customer Information</h2>
            </div>
            <div className="space-y-3">
              <div className="text-sm space-y-2">
                {showMoreUserInfo && userData && (
                  <div className="space-y-2 pt-2">
                    <p className="text-gray-600">
                      <span className="font-medium">Name:</span> {userData.name || 'N/A'}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Phone:</span> {userData.phone || 'N/A'}
                    </p>
                  </div>
                )}
                <p className="text-gray-600">
                  <span className="font-medium">Customer ID:</span> {order.userId}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Order Date:</span>{' '}
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => {
                  if (!userData) {
                    fetchUserDetails();
                  }
                  setShowMoreUserInfo(!showMoreUserInfo);
                }}
                className="text-sm text-[#53D695] hover:text-[#53D695]/80 font-medium flex items-center gap-1"
              >
                {loadingUserData ? (
                  <div className="h-4 w-4 border-2 border-[#53D695] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    {showMoreUserInfo ? 'Show Less' : 'Show More'}
                    <CaretDown
                      size={16}
                      className={`transition-transform ${showMoreUserInfo ? 'rotate-180' : ''}`}
                    />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Shipping Address - Updated */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={20} className="text-gray-500" />
              <h2 className="font-medium text-gray-900">Shipping Address</h2>
            </div>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-1 gap-2">
                <div>
                  <span className="text-gray-500 font-medium">House No./Building:</span>
                  <p className="text-gray-900">{order.shippingAddress.houseNumber}</p>
                </div>
                <div>
                  <span className="text-gray-500 font-medium">Road/Area:</span>
                  <p className="text-gray-900">{order.shippingAddress.roadName}</p>
                </div>
                <div>
                  <span className="text-gray-500 font-medium">City:</span>
                  <p className="text-gray-900">{order.shippingAddress.city}</p>
                </div>
                <div>
                  <span className="text-gray-500 font-medium">State:</span>
                  <p className="text-gray-900">{order.shippingAddress.state}</p>
                </div>
                <div>
                  <span className="text-gray-500 font-medium">ZIP Code:</span>
                  <p className="text-gray-900">{order.shippingAddress.zipCode}</p>
                </div>
              </div>
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
                <span className="text-gray-900">{order.paymentMethod.toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900">₹{order.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-900">Total</span>
                  <span className="font-bold text-gray-900">₹{order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
