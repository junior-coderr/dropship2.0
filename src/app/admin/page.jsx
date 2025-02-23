'use client';
import { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, Package, ShoppingCart, Users, CurrencyInr } from 'phosphor-react';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    products: 0,
    customers: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch('/api/admin/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
  }, []);

  const statsData = [
    {
      title: "Total Revenue",
      value: `₹${stats.revenue}`,
      change: "+12%",
      isPositive: true,
      icon: CurrencyInr,
      color: "bg-green-50",
      iconColor: "text-green-600"
    },
    {
      title: "Total Orders",
      value: stats.orders,
      change: "+8%",
      isPositive: true,
      icon: ShoppingCart,
      color: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      title: "Total Products",
      value: stats.products,
      change: "+24%",
      isPositive: true,
      icon: Package,
      color: "bg-purple-50",
      iconColor: "text-purple-600"
    },
    {
      title: "Total Customers",
      value: stats.customers,
      change: "-2%",
      isPositive: false,
      icon: Users,
      color: "bg-orange-50",
      iconColor: "text-orange-600"
    }
  ];

  return (
    <div className="">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-xl shadow-sm"
          >
            <div className="flex justify-between">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon size={24} className={stat.iconColor} weight="duotone" />
              </div>
              <span className={`flex items-center gap-1 text-sm ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change}
                {stat.isPositive ? (
                  <ArrowUp size={16} weight="bold" />
                ) : (
                  <ArrowDown size={16} weight="bold" />
                )}
              </span>
            </div>
            <h3 className="text-2xl font-bold mt-4">{stat.value}</h3>
            <p className="text-gray-600 text-sm">{stat.title}</p>
          </motion.div>
        ))}
      </div>

      <RecentOrders />
      <TopProducts />
    </div>
  );
}

function RecentOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch('/api/admin/orders/recent', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await res.json();
        if (data.success) {
          setOrders(data.orders);
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800">Recent Orders</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{order.customer}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full
                    ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{order.amount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{order.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TopProducts() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch('/api/admin/products/top', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await res.json();
        if (data.success) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800">Top Products</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units Sold</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {products.map((product) => (
              <tr key={product.name} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{product.sold}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{product.revenue}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full
                    ${product.stock > 40 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {product.stock}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
