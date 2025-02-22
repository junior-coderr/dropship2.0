import ProductGrid from '@/components/ProductGrid';
import Hero from '@/components/Hero';

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto">
      <Hero />
      <section className="my-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Featured Products</h2>
          {/* <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our carefully curated selection of premium products, 
            designed to enhance your digital lifestyle.
          </p> */}
        </div>
        <ProductGrid />
      </section>
    </div>
  );
}
