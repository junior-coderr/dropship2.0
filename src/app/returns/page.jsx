'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Package, ClockClockwise, CheckCircle, XCircle, ArrowClockwise } from 'phosphor-react';
import { toast } from 'react-hot-toast';

export default function ReturnsPage() {
  const { user, token } = useAuth();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && token) {
      fetchReturns();
    }
  }, [user, token]);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders?returnRequests=true', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Process orders to extract items with return requests
        const returnItems = [];
        
        data.orders.forEach(order => {
          order.items.forEach(item => {
            if (item.returnRequest) {
              returnItems.push({
                orderId: order._id,
                orderDate: new Date(order.createdAt).toLocaleDateString(),
                deliveredAt: order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString() : 'N/A',
                item: {
                  ...item,
                  productDetails: item.productId
                },
                returnRequest: item.returnRequest
              });
            }
          });
        });
        
        setReturns(returnItems);
      }
    } catch (error) {
      console.error('Error fetching returns:', error);
      toast.error('Failed to fetch return requests');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(price);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockClockwise size={14} className="mr-1" />
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <ArrowClockwise size={14} className="mr-1" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle size={14} className="mr-1" />
            Rejected
          </span>
        );
      case 'refunded':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle size={14} className="mr-1" />
            Refunded
          </span>
        );
      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-xl font-bold mb-4">Please log in to view your returns</h2>
        <Link
          href="/"
          className="flex items-center justify-center gap-2 text-[#53D695] font-medium"
        >
          <ArrowLeft size={20} />
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 px-3 sm:px-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Your Return Requests</h1>
        <Link
          href="/orders"
          className="flex items-center text-[#53D695] hover:underline text-sm sm:text-base"
        >
          <ArrowLeft className="mr-1" size={16} />
          Back to Orders
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-[#53D695] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : returns.length === 0 ? (
        <div className="text-center py-12 sm:py-16 bg-white rounded-lg shadow-sm px-4">
          <div className="inline-flex items-center justify-center w-14 sm:w-16 h-14 sm:h-16 bg-gray-100 rounded-full mb-4">
            <Package size={28} className="text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No return requests found</h3>
          <p className="text-gray-500 text-sm sm:text-base">You haven't submitted any return requests yet.</p>
          <Link
            href="/orders"
            className="mt-6 inline-flex items-center px-4 py-2 bg-[#53D695] text-white rounded-lg hover:bg-[#53D695]/90 transition-colors text-sm sm:text-base"
          >
            <Package size={18} className="mr-2" />
            View Your Orders
          </Link>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {returns.map((returnItem) => (
            <div key={`${returnItem.orderId}-${returnItem.item._id}`} className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Product image */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 mx-auto sm:mx-0">
                  {returnItem.item.productDetails?.images?.[0]?.url ? (
                    <div className="relative h-full w-full">
                      <Image
                        src={returnItem.item.productDetails.images[0].url}
                        alt={returnItem.item.productDetails.name || 'Product'}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Package size={28} className="text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Return details */}
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-4 mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900 text-center sm:text-left">
                        {returnItem.item.productDetails?.name || 'Product'}
                      </h3>
                      <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-2 text-sm">
                        {returnItem.item.size && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100">
                            Size: {returnItem.item.size}
                          </span>
                        )}
                        {returnItem.item.color && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100">
                            Color: {returnItem.item.color}
                          </span>
                        )}
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100">
                          Qty: {returnItem.item.quantity}
                        </span>
                      </div>
                    </div>
                    <div className="text-center sm:text-right mt-2 sm:mt-0">
                      <p className="font-medium text-gray-900">
                        {formatPrice(returnItem.item.price * returnItem.item.quantity)}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 sm:p-4 rounded-md mt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Return request date:</p>
                        <p className="text-sm font-medium">
                          {new Date(returnItem.returnRequest.requestedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status:</p>
                        <div className="mt-1">{getStatusBadge(returnItem.returnRequest.status)}</div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">UPI ID (for refund):</p>
                        <p className="text-sm font-medium break-all">{returnItem.returnRequest.upiId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Refund amount:</p>
                        <p className="text-sm font-medium">
                          {returnItem.returnRequest.refundAmount 
                            ? formatPrice(returnItem.returnRequest.refundAmount)
                            : 'Pending'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-sm text-gray-500">Reason for return:</p>
                      <p className="text-sm mt-1 bg-white p-2 sm:p-3 rounded border border-gray-100">
                        {returnItem.returnRequest.reason}
                      </p>
                    </div>
                    
                    {returnItem.returnRequest.status === 'refunded' && returnItem.returnRequest.refundedAt && (
                      <div className="mt-3 p-2 sm:p-3 bg-green-50 rounded-md">
                        <p className="text-sm text-green-700 flex items-center justify-center sm:justify-start">
                          <CheckCircle size={16} className="mr-1 flex-shrink-0" />
                          Refunded on {new Date(returnItem.returnRequest.refundedAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}