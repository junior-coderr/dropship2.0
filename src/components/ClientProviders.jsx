'use client';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { CountdownProvider } from '@/context/CountdownContext';
import { PopupProvider } from '@/context/PopupContext';
import TopLoader from '@/components/TopLoader';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileNav from '@/components/MobileNav';
import { Toaster } from 'react-hot-toast';

export default function ClientProviders({ children }) {
  return (
    <PopupProvider>
      <CountdownProvider>
        <AuthProvider>
          <CartProvider>
            <TopLoader />
            <Navbar />
            {children}
            <Footer />
            <MobileNav />
            <Toaster 
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#333',
                  color: '#fff',
                },
                success: {
                  iconTheme: {
                    primary: '#53D695',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </CartProvider>
        </AuthProvider>
      </CountdownProvider>
    </PopupProvider>
  );
}