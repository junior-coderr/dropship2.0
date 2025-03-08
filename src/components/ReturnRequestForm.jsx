'use client';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { ArrowClockwise, X, Warning } from 'phosphor-react';

export default function ReturnRequestForm({ orderId, item, onClose, onSuccess }) {
  const { token } = useAuth();
  const [reason, setReason] = useState('');
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      toast.error('Please provide a reason for your return request');
      return;
    }
    
    if (!upiId.trim()) {
      toast.error('Please provide a UPI ID for your refund');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/orders/return', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId,
          itemId: item._id,
          reason,
          upiId
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Return request submitted successfully');
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      } else {
        throw new Error(data.error || 'Failed to submit return request');
      }
    } catch (error) {
      console.error('Error submitting return request:', error);
      toast.error(error.message || 'Failed to submit return request');
    } finally {
      setLoading(false);
    }
  };

  // Calculate refund amount with 40% fee deduction
  const calculateRefund = () => {
    const originalAmount = item.price * item.quantity;
    const refundAmount = originalAmount * 0.6; // 60% of original price after 40% fee
    return {
      original: originalAmount,
      refund: refundAmount
    };
  };

  const amounts = calculateRefund();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Request Return</h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
        >
          <X size={20} />
        </button>
      </div>
      
      {/* Return Fee Notice */}
      <div className="mb-4 bg-amber-50 border border-amber-100 rounded-md p-3">
        <div className="flex items-start gap-2">
          <Warning size={20} className="text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">Return Fee Notice</p>
            <p className="text-xs text-amber-700 mt-1">
              A 40% restocking fee will be deducted from your refund amount. 
              You will receive ₹{amounts.refund.toFixed(0)} out of the original ₹{amounts.original.toFixed(0)}.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">
              Return requests are only eligible within 7 days of delivery. Once approved, 
              we'll process your refund to the UPI ID you provide.
            </p>
            
            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <p className="font-medium text-sm">
                {item.productId?.name || 'Product'}
                {item.price && ` - ₹${item.price}`}
              </p>
              <div className="mt-1 text-xs text-gray-500">
                {item.size && <span className="mr-2">Size: {item.size}</span>}
                {item.color && <span className="mr-2">Color: {item.color}</span>}
                <span>Qty: {item.quantity}</span>
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                Reason for return *
              </label>
              <textarea
                id="reason"
                name="reason"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#53D695] focus:border-[#53D695]"
                placeholder="Please explain why you want to return this item"
                required
              />
            </div>
            
            <div>
              <label htmlFor="upiId" className="block text-sm font-medium text-gray-700 mb-1">
                UPI ID for refund *
              </label>
              <input
                type="text"
                id="upiId"
                name="upiId"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#53D695] focus:border-[#53D695]"
                placeholder="e.g. yourname@bank"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter the UPI ID where you want to receive the refund.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#53D695] border border-transparent rounded-md shadow-sm hover:bg-[#53D695]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#53D695] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <ArrowClockwise size={16} className="mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Return Request'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}