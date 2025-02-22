'use client';
import { useState } from 'react';
import { Plus, Trash, PencilSimple } from 'phosphor-react';
import ProductForm from '@/components/admin/ProductForm';

export default function ProductsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Products</h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#53D695] text-white rounded-lg hover:bg-[#53D695]/90 transition-colors"
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      {/* Product Form Modal */}
      <ProductForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
      />

      {/* Products Table */}
      {/* Add your products table here */}
    </div>
  );
}
