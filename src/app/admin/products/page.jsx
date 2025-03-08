'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash, ArrowsClockwise } from 'phosphor-react';
import ProductForm from '@/components/admin/ProductForm';
import toast from 'react-hot-toast';
import { usePopup } from '@/context/PopupContext';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

export default function ProductsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showPopup } = usePopup();
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No auth token found');
      }

      const res = await fetch('/api/admin/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch products');
      }
      
      setProducts(data.products || []);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error(error.message || 'Failed to fetch products');
      if (error.message === 'No auth token found' || error.message === 'Unauthorized') {
        router.push('/');
      }
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    showPopup({
      title: 'Delete Product',
      message: 'Are you sure you want to delete this product? This action cannot be undone.',
      type: 'danger',
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('auth_token');
          const res = await fetch(`/api/admin/products/${productId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          const data = await res.json();
          if (!data.success) {
            throw new Error(data.error || 'Failed to delete');
          }

          toast.success('Product deleted successfully');
          fetchProducts();
        } catch (error) {
          console.error('Delete error:', error);
          toast.error(error.message || 'Failed to delete product');
        }
      }
    });
  };

  const handleProductClick = (productId) => {
    router.push(`/product/${productId}`);
  };

  const handleStatusUpdate = async (productId, updates) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to update product');
      }

      toast.success('Product updated successfully');
      fetchProducts();
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.message || 'Failed to update product');
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#53D695]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-800">Products</h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-[#53D695] text-white rounded-lg hover:bg-[#53D695]/90 w-full sm:w-auto"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 sm:px-6 py-4 text-center text-gray-500">
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr 
                    key={product._id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={(e) => {
                      if (!e.target.closest('button')) {
                        handleProductClick(product._id);
                      }
                    }}
                  >
                    <td className="px-3 sm:px-6 py-3">
                      <div className="relative w-10 h-10 sm:w-12 sm:h-12">
                        <Image 
                          src={product.images[0]?.url} 
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 40px, 48px"
                          className="object-cover rounded"
                        />
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3">
                      <div className="text-sm sm:text-base text-[#53D695] hover:underline truncate max-w-[150px] sm:max-w-[200px]">
                        {product.name}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 text-sm">₹{product.price}</td>
                    <td className="px-3 sm:px-6 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusUpdate(product._id, {
                            status: product.status === 'published' ? 'draft' : 'published'
                          });
                        }}
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full transition-colors ${
                          product.status === 'published' 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        <ArrowsClockwise size={12} />
                        {product.status}
                      </button>
                    </td>
                    <td className="px-3 sm:px-6 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusUpdate(product._id, {
                            inStock: !product.inStock
                          });
                        }}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                          product.inStock 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        <ArrowsClockwise size={12} />
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </button>
                    </td>
                    <td className="px-3 sm:px-6 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(product._id);
                        }}
                        className="text-red-600 hover:text-red-900 p-1"
                      >
                        <Trash size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ProductForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          fetchProducts();
        }}
      />
    </div>
  );
}
