'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCountdown } from '@/hooks/useCountdown';
import { Clock, Fire } from 'phosphor-react';

export default function Hero() {
  const { minutes, seconds } = useCountdown(30);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
    const featuredSection = document.getElementById('featured-products');
    if (featuredSection) {
      featuredSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
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
            <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-7 py-2 sm:py-3 bg-white/5 
              backdrop-blur-sm rounded-full text-xs sm:text-sm font-medium border border-white/10">
              <Fire weight="fill" className="w-4 h-4 text-amber-500" />
              <span className="text-amber-500">Limited Offer</span>
              <div className="flex items-center gap-2 px-2 py-1 bg-amber-500/10 rounded-full text-white/90">
                <Clock className="w-4 h-4" />
                <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
              </div>
            </div>
            
            <div className="space-y-3 sm:space-y-6 animate-reveal">
              <h2 className="text-4xl sm:text-7xl font-black text-white leading-tight tracking-tight drop-shadow-2xl">
                Discover Our <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-green to-emerald-400">
                  Premium Collection
                </span>
              </h2>
              <p className="text-xl sm:text-2xl text-white/90 font-medium drop-shadow-lg">
                Up to <span className="text-brand-green font-bold">50% Off</span> on Selected Items
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

          <div className="absolute top-12 right-12 w-28 h-28 border-4 border-white/10 rounded-full"></div>
          <div className="absolute bottom-12 right-36 w-20 h-20 border-4 border-brand-green/20 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
