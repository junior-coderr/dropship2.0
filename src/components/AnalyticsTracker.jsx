'use client';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

export default function AnalyticsTracker() {
  const auth = useAuth();
  const user = auth?.user;
  const isLoading = auth?.isLoading; // Get loading state from auth context
  const pathname = usePathname();
  const pageStartTime = useRef(Date.now());
  const lastActivityTime = useRef(Date.now());
  const isActive = useRef(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  
  // Don't perform any tracking until authentication is completed
  useEffect(() => {
    if (isLoading === false) { // Only when auth loading is explicitly false (not undefined or true)
      setAuthChecked(true);
      // Determine if user is admin
      if (user?.role === 'admin') {
        setIsAdmin(true);
        console.log('Admin user detected, analytics tracking disabled');
      } else {
        setIsAdmin(false);
      }
    }
  }, [user, isLoading]);

  // Track page view when pathname changes and auth is checked
  useEffect(() => {
    // Important: Don't track anything until auth is checked
    if (!authChecked || !pathname) return;
    
    // Skip tracking entirely for admin users or admin paths
    if (isAdmin || pathname.startsWith('/admin')) {
      console.log('Skipping analytics for admin user or admin path:', pathname);
      return;
    }
    
    const userId = user?._id || "anonymous";
    pageStartTime.current = Date.now();

    console.log('Starting analytics tracking for path:', pathname);

    // Function to track events
    const trackEvent = async (event, page, duration = 0, metadata = {}) => {
      try {
        await fetch("/api/analytics/track", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userId,
            event,
            page,
            duration,
            metadata,
          }),
        }).catch(err => console.log("Analytics API error:", err));
      } catch (error) {
        console.error("Failed to track analytics event:", error);
      }
    };

    // Track page view
    trackEvent("pageView", pathname, 0, { url: pathname });

    // Track user activity
    const handleActivity = () => {
      if (!isActive.current) {
        isActive.current = true;
        trackEvent("engagement", pathname, 0, { type: "return" });
      }
      lastActivityTime.current = Date.now();
    };

    const handleInactivity = () => {
      const inactiveTime = Date.now() - lastActivityTime.current;
      if (isActive.current && inactiveTime > 60000) {
        isActive.current = false;
        trackEvent("engagement", pathname, 0, { type: "inactive" });
      }
    };

    // Set up event listeners for user activity
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Check for inactivity every 30 seconds
    const inactivityCheck = setInterval(handleInactivity, 30000);

    // Track page exit when component unmounts
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      clearInterval(inactivityCheck);
      
      const duration = Math.floor((Date.now() - pageStartTime.current) / 1000);
      trackEvent("exit", pathname, duration, { url: pathname });
    };
  }, [pathname, user, isAdmin, authChecked]);

  // This component doesn't render anything
  return null;
}
