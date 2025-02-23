'use client';
import { useState, useEffect } from 'react';
import { Plus, Trash, PencilSimple } from 'phosphor-react';
import ProductForm from '@/components/admin/ProductForm';
import toast from 'react-hot-toast';

export default function ProductsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const token = localStorage.getItem('auth_token');
      console.log(token);
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
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Products</h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#53D695] text-white rounded-lg hover:bg-[#53D695]/90"
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-4 text-center">Loading...</div>
        ) : products.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No products found</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product._id}>
                  <td className="px-6 py-4">
                    <img 
                      src={product.images[0]?.url} 
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  </td>
                  <td className="px-6 py-4">{product.name}</td>
                  <td className="px-6 py-4">${product.price}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      product.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <PencilSimple size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ProductForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingProduct(null);
          fetchProducts(); // Refresh products after form closes
        }}
        product={editingProduct}
      />
    </div>
  );
}
