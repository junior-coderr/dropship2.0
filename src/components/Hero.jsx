'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCountdown } from '@/context/CountdownContext';
import { Clock, Fire } from 'phosphor-react';
import CountdownTimer from './CountdownTimer';
import { useProducts } from '@/hooks/useProducts';

export default function Hero() {
  const { countdown } = useCountdown();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const featuredRef = useRef(null);
  const { products } = useProducts({ limit: 5 }); // Fetch 5 products for the hero
  const [heroImages, setHeroImages] = useState([]);

  useEffect(() => {
    if (products?.length > 0) {
      // Get images from products that have at least one image
      const validProducts = products.filter(product => product.images?.[0]?.url);
      const images = validProducts.map(product => product.images[0].url);
      setHeroImages(images);
    }
  }, [products]);

  useEffect(() => {
    if (heroImages.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [heroImages]);

  const scrollToFeatured = (e) => {
    e.preventDefault();
    featuredRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest'
    });
  };

  return (
    <>
      <div className="relative w-full bg-gray-50">
        {/* Removed max-w-8xl class to make it full width */}
        <div className="w-full px-0 py-0">
          <div className="my-0">
            <div className="relative h-[420px] sm:h-[650px] overflow-hidden">
              <div className="absolute inset-0">
                <Image
                  src={heroImages[currentImageIndex] || '/placeholder.png'}
                  alt="Featured collection"
                  fill
                  className="object-cover transition-all duration-1000 ease-out"
                  priority
                  sizes="100vw"
                  quality={90}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-black/40"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
              </div>

              <div className="relative h-full flex items-center">
                <div className="max-w-xl mx-6 sm:mx-16 space-y-6 sm:space-y-10">
                  <div className="inline-flex justify-center items-center gap-1 sm:gap-3 px-4 sm:px-7 py-2 sm:py-3 bg-white/5 
                    backdrop-blur-sm rounded-full text-xs sm:text-sm font-medium border border-white/10 w-[fit-content]">
                    <Fire weight="fill" className="w-4 h-4 text-red-500" />
                    <span className="text-red-500 text-center">Special Discount</span>
                    <div className="flex items-center gap-1 px-3 py-1 bg-red-500/90 rounded-full text-white">
                      <span className="font-semibold">30% OFF</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3 sm:space-y-6 animate-reveal">
                    <h2 className="text-4xl sm:text-7xl font-black text-white leading-tight tracking-tight drop-shadow-2xl">
                      Shop Trending <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-green to-emerald-400">
                        Must-Have Deals
                      </span>
                    </h2>
                    <p className="text-xl sm:text-2xl text-white/90 font-medium drop-shadow-lg">
                      Trending Products Daily • <span className="text-brand-green font-bold">Free Shipping</span>
                    </p>
                  </div>

                  <Link 
                    href="#featured-products"
                    onClick={scrollToFeatured}
                    className="group/btn inline-flex items-center px-7 sm:px-10 py-3.5 sm:py-5 bg-white text-brand-black 
                      rounded-full font-bold transition-all duration-200
                      shadow-md hover:shadow-xl hover:scale-105 text-sm sm:text-base"
                  >
                    Shop Now
                    <svg 
                      className="w-5 h-5 ml-2 transition-transform duration-200 group-hover/btn:translate-x-1" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>

                <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6">
                  <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-black/30 backdrop-blur-sm rounded-full">
                    <span className="text-white/90 text-sm font-medium">Ends in:</span>
                    <CountdownTimer className="text-white text-sm font-bold" />
                  </div>
                  {/* Mobile version - minimal style */}
                  <div className="flex sm:hidden items-center">
                    <CountdownTimer className="text-white/90 text-xs font-medium" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div ref={featuredRef} id="featured-products" className="scroll-mt-6">
      </div>
    </>
  );
}
