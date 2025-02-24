'use client';
import { useState, useEffect, useRef } from 'react'; // Add useRef
import Link from 'next/link';
import Image from 'next/image';
import { useCountdown } from '@/context/CountdownContext'; // Update import
import { Clock, Fire } from 'phosphor-react';
import CountdownTimer from './CountdownTimer';

export default function Hero() {
  const { countdown } = useCountdown(); // Get countdown from context
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const featuredRef = useRef(null);

  const images = [
    "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=2070&auto=format&fit=crop"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, []);

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
      <div className="relative bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="my-4 sm:my-12">
            <div className="relative h-[420px] sm:h-[650px] rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden">
              <div className="absolute inset-0">
                <Image
                  src={images[currentImageIndex]}
                  alt="Featured collection"
                  fill
                  className="object-cover transition-all duration-1000 ease-out"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw"
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

                  <a 
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
                  </a>
                </div>

                {/* Remove or comment out the decorative circles if they interfere */}
                {/* <div className="absolute top-12 right-12 w-28 h-28 border-4 border-white/10 rounded-full"></div>
                <div className="absolute bottom-12 right-36 w-20 h-20 border-4 border-brand-green/20 rounded-full"></div> */}

                {/* Updated countdown timer with improved mobile layout */}
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
          
          {/* Remove the old countdown timer section */}
        </div>
      </div>
      
      {/* Add this section right after the hero */}
      <div ref={featuredRef} id="featured-products" className="scroll-mt-6">
        {/* Your featured products content will go here */}
      </div>
    </>
  );
}
