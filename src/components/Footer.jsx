'use client';
import Link from 'next/link';
import Logo from './Logo';
import { useState } from 'react';
import SupportForm from './common/SupportForm';

export default function Footer() {
  const [showSupportForm, setShowSupportForm] = useState(false);

  return (
    <>
      <footer className="bg-white border-t border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Logo and About */}
              <div className="space-y-4">
                <Logo />
                <p className="text-sm text-gray-600 max-w-xs">
                  Your one-stop destination for trendy products and accessories at incredible prices.
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Links</h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="/terms" className="text-sm text-gray-600 hover:text-[#53D695] transition-colors">
                      Terms & Conditions
                    </Link>
                  </li>
                
                  <li>
                    <button 
                      onClick={() => setShowSupportForm(true)}
                      className="text-sm text-gray-600 hover:text-[#53D695] transition-colors"
                    >
                      Contact Support
                    </button>
                  </li>
                </ul>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Contact Us</h3>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Email:</span> cupidcart29@gamil.com
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-100 py-8">
            <p className="text-sm text-center text-gray-500">
              © {new Date().getFullYear()} cupidcart. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Support Form Modal */}
      {showSupportForm && (
        <SupportForm onClose={() => setShowSupportForm(false)} />
      )}
    </>
  );
}