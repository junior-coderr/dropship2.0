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
      <head>
{/* Meta Pixel Code */}
<script dangerouslySetInnerHTML={{ __html: `
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '925512732989578');
  fbq('track', 'PageView');
`}} />
<noscript><img height="1" width="1" style={{display: 'none'}}
src="https://www.facebook.com/tr?id=925512732989578&ev=PageView&noscript=1"
/></noscript>
{/* End Meta Pixel Code */}
      </head>
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
