'use client';
import { useState, useEffect } from 'react';
// ...existing imports...

export default function DashboardPage() {
  // ...existing state and other code...

  const formatOrderCount = (orders) => {
    if (typeof orders === 'object') {
      return orders.total || 0; // Return total orders if it's an object
    }
    return orders || 0; // Return the number directly if it's already a number
  };

  return (
    <div className="p-6">
      {/* ...existing JSX... */}
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Revenue"
          value={`₹${stats?.revenue || '0'}`}
          change={stats?.changes?.revenue}
          icon={<CurrencyDollar size={24} />}
          loading={loading}
        />
        <StatsCard
          title="Total Orders"
          value={formatOrderCount(stats?.orders)}
          subValue={`${stats?.pendingOrders || 0} pending`}
          change={stats?.changes?.orders}
          icon={<ShoppingBag size={24} />}
          loading={loading}
        />
        <StatsCard
          title="Total Products"
          value={stats?.products || 0}
          change={stats?.changes?.products}
          icon={<Package size={24} />}
          loading={loading}
        />
        <StatsCard
          title="Total Customers"
          value={stats?.customers || 0}
          change={stats?.changes?.customers}
          icon={<Users size={24} />}
          loading={loading}
        />
      </div>

      {/* Rest of the dashboard content */}
      {/* ...existing JSX... */}
    </div>
  );
}
