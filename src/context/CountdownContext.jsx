'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const CountdownContext = createContext();

export function CountdownProvider({ children }) {
  const [countdown, setCountdown] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const response = await fetch('/api/offers/active');
        const data = await response.json();
        
        if (data.success) {
          const endTime = new Date(data.offer.endTime).getTime();
          startCountdown(endTime);
        }
      } catch (error) {
        console.error('Error fetching offer:', error);
      } finally {
        setLoading(false);
      }
    };

    const startCountdown = (endTime) => {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const distance = endTime - now;

        if (distance < 0) {
          // Refresh offer when countdown ends
          fetchOffer();
        } else {
          setCountdown({
            hours: Math.floor(distance / (1000 * 60 * 60)),
            minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((distance % (1000 * 60)) / 1000)
          });
        }
      }, 1000);

      return () => clearInterval(timer);
    };

    fetchOffer();
  }, []);

  return (
    <CountdownContext.Provider value={{ countdown, loading }}>
      {children}
    </CountdownContext.Provider>
  );
}

export function useCountdown() {
  return useContext(CountdownContext);
}
