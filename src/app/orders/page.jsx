'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
 import { Package, CaretLeft, PencilSimple } from 'phosphor-react';
import { useRouter } from 'next/navigation';

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  
  // Mock orders data
  useEffect(() => {
    setOrders([
      {
        id: '1',
        date: '2024-01-15',
        status: 'Delivered',
        total: 199.99,
        items: [
          {
            id: 1,
            name: 'Cotton T-Shirt',
            image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
            price: 99.99,
          },
          {
            id: 2,
            name: 'Denim Jeans',
            image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800',
            price: 100.00,
          },
        ],
      },
      // Add more mock orders as needed
    ]);
  }, []);

  if (orders.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="h-40 w-40 rounded-full bg-gray-50 flex items-center justify-center">
          <Package size={48} className="text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">No orders yet</h2>
        <p className="text-gray-500">When you place orders, they will appear here.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with back button, title, and edit button */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => router.back()}
          className="p-2.5 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <CaretLeft size={20} className="text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Your Orders</h1>
        <button 
          onClick={() => router.push('/profile/edit')}
          className="p-2.5 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors group"
          title="Edit delivery details"
        >
          <PencilSimple 
            size={20} 
            className="text-gray-700 group-hover:text-[#53D695] transition-colors" 
          />
        </button>
      </div>
      
      {/* Add delivery info section */}
      <div className="mb-6 p-4 bg-white rounded-xl border border-gray-100">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-gray-900">Delivery Details</h3>
            <div className="mt-2 space-y-1 text-sm text-gray-500">
              <p>John Doe</p>
              <p>+1 234 567 8900</p>
              <p>123 Street Name, City, State, 12345</p>
            </div>
          </div>
          <button 
            onClick={() => router.push('/profile/edit')}
            className="text-[#53D695] text-sm font-medium hover:underline"
          >
            Edit
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <div 
            key={order.id}
            className="bg-white rounded-xl border border-gray-100 overflow-hidden"
          >
            {/* Order header */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-900">Order #{order.id}</p>
                <p className="text-sm text-gray-500">
                  {new Date(order.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <span className="px-3 py-1 bg-green-50 text-green-600 text-sm font-medium rounded-full">
                {order.status}
              </span>
            </div>

            {/* Order items */}
            <div className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <div key={item.id} className="p-4 flex gap-4">
                  <div className="relative h-24 w-24 flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1 flex justify-between">
                    <div className="space-y-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">Quantity: 1</p>
                      <p className="text-sm text-gray-500">Size: M</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">${item.price}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order total */}
            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">Order Total</span>
                <span className="font-bold text-gray-900">${order.total}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
