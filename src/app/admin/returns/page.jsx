'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { ClockClockwise, CheckCircle, XCircle, ArrowClockwise, Package } from 'phosphor-react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import {LoadingState} from '@/components/admin/LoadingState';

export default function AdminReturnsPage() {
  const { token } = useAuth();
  const [returnRequests, setReturnRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState(new Set());

  useEffect(() => {
    if (token) {
      fetchReturnRequests();
    }
  }, [token]);

  const fetchReturnRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/returns', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setReturnRequests(data.returnRequests);
      } else {
        throw new Error(data.error || 'Failed to fetch return requests');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to fetch return requests');
    } finally {
      setLoading(false);
    }
  };

  const updateReturnStatus = async (orderId, itemId, status) => {
    const processingId = `${orderId}-${itemId}`;
    try {
      setProcessingIds(prev => new Set(prev).add(processingId));
      
      const response = await fetch('/api/admin/returns', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId,
          itemId,
          status
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Return request ${status} successfully`);
        fetchReturnRequests(); // Refresh the list
      } else {
        throw new Error(data.error || `Failed to update return request`);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to update return request');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(processingId);
        return newSet;
      });
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

  if (loading) {
    return <LoadingState />;
  }

  return (
    <AdminGuard>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">Return Requests</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage customer return requests and process refunds.
            </p>
          </div>
        </div>

        {returnRequests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow mt-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <CheckCircle size={32} className="text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No return requests</h3>
            <p className="text-gray-500">There are no return requests at this time.</p>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {returnRequests.map((request) => {
              const processingId = `${request.orderId}-${request.item.itemId}`;
              const isProcessing = processingIds.has(processingId);
              
              // Extract product details with fallbacks
              const product = request.item.productId || {};
              const productName = product.name || 'Product name unavailable';
              const productImage = product.images && product.images.length > 0 
                ? product.images[0].url 
                : null;
              
              return (
                <div 
                  key={`${request.orderId}-${request.item.itemId}`} 
                  className="bg-white shadow rounded-lg overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row gap-4 pb-4 border-b">
                          {/* Basic info */}
                          <div className="flex-1">
                            <h3 className="font-medium">Return Request Details</h3>
                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500">Order ID:</p>
                                <Link 
                                  href={`/admin/orders/${request.orderId}`}
                                  className="text-[#53D695] hover:underline font-medium"
                                >
                                  {request.orderId}
                                </Link>
                              </div>
                              <div>
                                <p className="text-gray-500">Order Date:</p>
                                <p>{new Date(request.orderDate).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Delivered On:</p>
                                <p>{request.deliveredAt ? new Date(request.deliveredAt).toLocaleDateString() : 'Not delivered'}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Return Requested On:</p>
                                <p>{new Date(request.returnRequest.requestedAt).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Status:</p>
                                <div className="mt-1">{getStatusBadge(request.returnRequest.status)}</div>
                              </div>
                              <div>
                                <p className="text-gray-500">UPI ID for Refund:</p>
                                <p className="font-medium">{request.returnRequest.upiId}</p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Item info */}
                          <div className="sm:w-52">
                            <h3 className="font-medium">Product</h3>
                            <div className="mt-2 grid gap-2">
                              <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden">
                                {productImage ? (
                                  <div className="relative h-full w-full">
                                    <Image
                                      src={productImage}
                                      alt={productName}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center h-full w-full bg-gray-200">
                                    <Package size={24} className="text-gray-400" />
                                  </div>
                                )}
                              </div>
                              
                              <p className="text-sm font-medium text-gray-900">
                                {productName}
                              </p>
                              
                              <div className="text-sm text-gray-500">
                                {request.item.size && <p>Size: {request.item.size}</p>}
                                {request.item.color && <p>Color: {request.item.color}</p>}
                                <p>Qty: {request.item.quantity}</p>
                                <p className="font-medium text-gray-900">
                                  {formatPrice(request.item.price * request.item.quantity)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Return reason */}
                        <div className="mt-4">
                          <h3 className="font-medium">Reason for Return</h3>
                          <p className="mt-2 text-sm bg-gray-50 p-3 rounded-md">
                            {request.returnRequest.reason}
                          </p>
                        </div>
                        
                        {/* Actions */}
                        {request.returnRequest.status === 'pending' && (
                          <div className="mt-6 flex flex-wrap gap-4">
                            <button
                              onClick={() => updateReturnStatus(request.orderId, request.item.itemId, 'approved')}
                              disabled={isProcessing}
                              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                              {isProcessing ? 'Processing...' : 'Approve Return'}
                            </button>
                            <button
                              onClick={() => updateReturnStatus(request.orderId, request.item.itemId, 'rejected')}
                              disabled={isProcessing}
                              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                            >
                              {isProcessing ? 'Processing...' : 'Reject Return'}
                            </button>
                          </div>
                        )}
                        
                        {request.returnRequest.status === 'approved' && (
                          <div className="mt-6">
                            <button
                              onClick={() => updateReturnStatus(request.orderId, request.item.itemId, 'refunded')}
                              disabled={isProcessing}
                              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                            >
                              {isProcessing ? 'Processing...' : 'Mark as Refunded'}
                            </button>
                            <div className="mt-2 text-sm text-gray-500">
                              Click when you have processed the refund to UPI ID: <span className="font-medium">{request.returnRequest.upiId}</span>
                            </div>
                          </div>
                        )}
                        
                        {request.returnRequest.status === 'refunded' && request.returnRequest.refundedAt && (
                          <div className="mt-4 p-3 bg-green-50 rounded-md">
                            <p className="text-sm text-green-700 flex items-center">
                              <CheckCircle size={16} className="mr-1 flex-shrink-0" />
                              Refunded on {new Date(request.returnRequest.refundedAt).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminGuard>
  );
}