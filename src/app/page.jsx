import ProductGrid from '@/components/ProductGrid';
import Hero from '@/components/Hero';
import Script from 'next/script';
import Image from 'next/image';

export const metadata = {
  title: "CupidCart | Premium Online Shopping Experience",
  description: "Find high-quality products with fast shipping and excellent customer support. The best online shopping destination for quality products at great prices.",
  keywords: "CupidCart, online shopping, e-commerce, premium products, fast shipping, online store",
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "CupidCart | Premium Online Shopping Experience",
    description: "Your reliable online shopping destination with curated premium products and fast worldwide shipping",
    url: '/',
    siteName: "CupidCart",
    locale: 'en_US',
    type: 'website',
  },
};

export default function Home() {
  return (
    <>
      <Script id="schema-org" type="application/ld+json">
        {`
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "CupidCart",
            "url": "/",
            "logo": "/Heart Logo Design.png",
            "description": "Premium online shopping destination with high-quality products, fast shipping, and excellent customer support.",
            "sameAs": [
              "https://facebook.com/cupidcart",
              "https://twitter.com/cupidcart",
              "https://instagram.com/cupidcart"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+1-800-123-4567",
              "contactType": "customer service",
              "availableLanguage": ["English"]
            }
          }
        `}
      </Script>
      
      <div className="max-w-7xl mx-auto">
        <Hero />
        <section className="my-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Products</h2>
          </div>
          <ProductGrid />
        </section>
      </div>
    </>
  );
}
