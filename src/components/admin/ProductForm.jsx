'use client';
import { useState } from 'react';
import { X } from 'phosphor-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function ProductForm({ isOpen, onClose, product }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(product || {
    name: '',
    description: '',
    price: '',
    images: [],
    category: '',
    stock: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/products', {
        method: product ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to save product');

      toast.success(product ? 'Product updated!' : 'Product created!');
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black opacity-30" onClick={onClose} />
        
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
          className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              {product ? 'Edit Product' : 'New Product'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form fields */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#53D695] text-white rounded-lg hover:bg-[#53D695]/90 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Product'}
            </button>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
}
