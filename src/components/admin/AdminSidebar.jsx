'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, ShoppingBag, ChartLine, SignOut } from 'phosphor-react';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: ChartLine },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
];

export function AdminSidebar({ onItemClick }) {
  const pathname = usePathname();
  const { signOut } = useAuth();

  const handleItemClick = () => {
    if (onItemClick) {
      onItemClick();
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200">
      <div className="flex flex-col h-full">
        <div className="flex items-center p-4 border-b">
          <span className="text-xl font-semibold text-gray-800">Admin Panel</span>
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={handleItemClick}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                      pathname === item.href
                        ? 'bg-[#53D695] text-white'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={20} />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={() => {
              signOut();
              handleItemClick();
            }}
            className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full"
          >
            <SignOut size={20} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
