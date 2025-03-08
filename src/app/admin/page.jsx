'use client';
import { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, Package, ShoppingCart, Users, CurrencyInr } from 'phosphor-react';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    products: 0,
    customers: 0,
    changes: {
      revenue: 0,
      orders: 0,
      products: 0,
      customers: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        // console.log('token:', token);
        const res = await fetch('/api/admin/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include' // Add this to include cookies
        });

        if (!res.ok) {
          throw new Error('Failed to fetch stats');
        }

        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
        } else {
          throw new Error(data.error || 'Failed to fetch stats');
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  const formatValue = (value, type) => {
    if (type === 'currency') {
      return value ? new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
      }).format(value) : '₹0';
    }
    return value || 0;
  };

  const statsData = [
    {
      title: "Total Revenue",
      value: formatValue(stats.revenue, 'currency'),
      change: `${stats.changes?.revenue > 0 ? '+' : ''}${stats.changes?.revenue}%`,
      isPositive: stats.changes?.revenue >= 0,
      icon: CurrencyInr,
      color: "bg-green-50",
      iconColor: "text-green-600"
    },
    {
      title: "Total Orders",
      value: formatValue(stats.orders),
      change: `${stats.changes?.orders > 0 ? '+' : ''}${stats.changes?.orders}%`,
      isPositive: stats.changes?.orders >= 0,
      icon: ShoppingCart,
      color: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      title: "Total Products",
      value: formatValue(stats.products),
      change: `${stats.changes?.products > 0 ? '+' : ''}${stats.changes?.products}%`,
      isPositive: stats.changes?.products >= 0,
      icon: Package,
      color: "bg-purple-50",
      iconColor: "text-purple-600"
    },
    {
      title: "Total Customers",
      value: formatValue(stats.customers),
      change: `${stats.changes?.customers > 0 ? '+' : ''}${stats.changes?.customers}%`,
      isPositive: stats.changes?.customers >= 0,
      icon: Users,
      color: "bg-orange-50",
      iconColor: "text-orange-600"
    }
  ];

  return (
    <div className="p-2 sm:p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statsData.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-4 sm:p-6 rounded-xl shadow-sm"
          >
            <div className="flex justify-between">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon size={20} className={stat.iconColor} weight="duotone" />
              </div>
              <span className={`flex items-center gap-0.5 text-xs sm:text-sm ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change}
                {stat.isPositive ? (
                  <ArrowUp size={14} weight="bold" />
                ) : (
                  <ArrowDown size={14} weight="bold" />
                )}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mt-3">{stat.value}</h3>
            <p className="text-gray-600 text-xs sm:text-sm">{stat.title}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
