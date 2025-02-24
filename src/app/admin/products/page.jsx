'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash, PencilSimple } from 'phosphor-react';
import ProductForm from '@/components/admin/ProductForm';
import toast from 'react-hot-toast';
import { usePopup } from '@/context/PopupContext';

export default function ProductsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showPopup } = usePopup();
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/admin/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch');
      }
      
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast.error('Failed to fetch products');
      console.error('Fetch error:', error);
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

          if (res.ok) {
            toast.success('Product deleted');
            fetchProducts();
          } else {
            throw new Error('Failed to delete');
          }
        } catch (error) {
          toast.error('Failed to delete product');
        }
      }
    });
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleProductClick = (productId) => {
    router.push(`/product/${productId}`);
  };

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
                <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => (
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
                    <img 
                      src={product.images[0]?.url} 
                      alt={product.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded"
                    />
                  </td>
                  <td className="px-3 sm:px-6 py-3">
                    <div className="text-sm sm:text-base text-[#53D695] hover:underline truncate max-w-[150px] sm:max-w-[200px]">
                      {product.name}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 text-sm">₹{product.price}</td>
                  <td className="px-3 sm:px-6 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      product.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.status}
                    </span>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ProductForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingProduct(null);
          fetchProducts();
        }}
        product={editingProduct}
      />
    </div>
  );
}
