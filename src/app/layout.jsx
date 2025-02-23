import "./globals.css";
import Navbar from '@/components/Navbar';
import MobileNav from '@/components/MobileNav';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { Playfair_Display } from 'next/font/google';
import { Sora, DM_Sans } from 'next/font/google';
import TopLoader from '@/components/TopLoader';
import { Toaster } from 'react-hot-toast';
import { CountdownProvider } from '@/context/CountdownContext';

const playfair = Playfair_Display({ subsets: ['latin'] });

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  weight: ['600', '700'],
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
});

export const metadata = {
  title: "E-commerce website",
  description: "E-commerce website",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${sora.variable} ${dmSans.variable} font-dm-sans pb-24 sm:pb-0`}>
        <CountdownProvider>
          <AuthProvider>
            <CartProvider>
              <TopLoader />
              <Navbar />
              <main className="container mx-auto px-4 py-8">
                {children}
              </main>
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
      </body>
    </html>
  );
}
