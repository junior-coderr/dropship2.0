'use client';
import { useState } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { List, X } from 'phosphor-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLayout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <AdminGuard>
      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <AdminSidebar />
        </div>

        {/* Mobile Header with Hamburger */}
        <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-50 px-4">
          <div className="flex items-center justify-between h-full">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <List size={24} />
            </button>
            <span className="font-semibold text-gray-800">Admin Panel</span>
            <div className="w-10" /> {/* Spacer for center alignment */}
          </div>
        </div>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50 md:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                className="fixed top-0 left-0 bottom-0 w-64 bg-white z-50 md:hidden"
              >
                <div className="p-4 border-b flex justify-between items-center">
                  <span className="font-semibold text-gray-800">Admin Panel</span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X size={20} />
                  </button>
                </div>
                <AdminSidebar onItemClick={() => setIsMobileMenuOpen(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-8 md:p-8 pt-20 md:pt-8">
          {children}
        </main>
      </div>
    </AdminGuard>
  );
}
