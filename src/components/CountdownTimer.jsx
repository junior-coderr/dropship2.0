'use client';
import { useCountdown } from '@/context/CountdownContext';

export default function CountdownTimer({ className = "text-[#53D695]" }) {
  const { countdown, loading } = useCountdown();

  if (loading) {
    return (
      <div className="flex gap-1 items-center">
        <div className="h-6 w-16 bg-gray-200 animate-pulse rounded"></div>
      </div>
    );
  }

  return (
    <div className="flex gap-[0] items-center justify-center text-sm font-medium">
      <span className={`px-1.5 py-1 rounded ${className}`}>
        {String(countdown.hours).padStart(2, '0')}h
      </span>
      <span className={`px-1.5 py-1 rounded ${className}`}>
        {String(countdown.minutes).padStart(2, '0')}m
      </span>
      <span className={`px-1.5 py-1 rounded ${className}`}>
        {String(countdown.seconds).padStart(2, '0')}s
      </span>
    </div>
  );
}
