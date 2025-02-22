'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function TopLoader() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999]">
      <div className="h-[4px] w-full bg-gray-100">
        <div 
          className="h-full bg-[#53D695] animate-progress relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"/>
        </div>
      </div>
    </div>
  );
}
