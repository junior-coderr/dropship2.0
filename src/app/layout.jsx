import "./globals.css";
import { Playfair_Display } from 'next/font/google';
import { Sora, DM_Sans } from 'next/font/google';
import ClientProviders from '@/components/ClientProviders';

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
  title: "CupidCart | Premium Online Shopping Experience",
  description: "Find high-quality products with fast shipping and excellent customer support. Your one-stop shopping solution for premium products online.",
  keywords: "CupidCart, online shopping, e-commerce, fast shipping, premium products, quality items",
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1",
  openGraph: {
    title: "CupidCart | Premium Online Shopping Experience",
    description: "Your reliable shopping partner with curated premium products and fast worldwide shipping",
    type: "website",
    url: "/",
    siteName: "CupidCart",
    images: [
      {
        url: "/Heart Logo Design.png",
        width: 1200,
        height: 630,
        alt: "CupidCart",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CupidCart | Premium Online Shopping Experience",
    description: "Your reliable shopping partner with curated premium products and fast worldwide shipping",
    images: ["/Heart Logo Design.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${sora.variable} ${dmSans.variable} font-dm-sans pb-24 sm:pb-0`}>
        <ClientProviders>
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </ClientProviders>
      </body>
    </html>
  );
}
