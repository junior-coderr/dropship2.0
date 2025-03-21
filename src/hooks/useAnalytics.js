"use client";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import { shouldTrackAnalytics } from "@/lib/analytics";

export function useAnalytics() {
  const auth = useAuth();
  const user = auth?.user;
  const isLoading = auth?.isLoading;
  const pathname = usePathname();
  const pageStartTime = useRef(Date.now());
  const lastActivityTime = useRef(Date.now());
  const isActive = useRef(true);
  const [authChecked, setAuthChecked] = useState(false);

  // Wait until auth is checked before determining tracking status
  useEffect(() => {
    if (isLoading === false) {
      setAuthChecked(true);
    }
  }, [isLoading]);

  // Use the utility function to determine if we should track
  const shouldTrack = authChecked && shouldTrackAnalytics(user, pathname);

  // Track page view when pathname changes
  useEffect(() => {
    if (!pathname || !authChecked) return; // Don't track if pathname is not available or auth isn't checked
    if (!shouldTrack) {
      console.log("Analytics tracking disabled for:", {
        user: user?.role,
        pathname,
      });
      return;
    }

    const userId = user?._id || "anonymous";
    pageStartTime.current = Date.now();

    // Detect if this is a page reload
    const isPageReload =
      window.performance &&
      performance.navigation &&
      performance.navigation.type === 1;

    // Track page view
    trackEvent("pageView", pathname, 0, {
      url: pathname,
      source: isPageReload ? "reload" : "navigation",
    });

    // Track page exit when component unmounts
    return () => {
      const duration = Math.floor((Date.now() - pageStartTime.current) / 1000);
      trackEvent("exit", pathname, duration, { url: pathname });
    };
  }, [pathname, user, shouldTrack, authChecked]);

  // Track user activity to determine engagement
  useEffect(() => {
    if (!pathname) return; // Don't set up tracking if pathname is not available
    if (!shouldTrack) return; // Skip tracking for admins

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
        // 60 seconds of inactivity
        isActive.current = false;
        trackEvent("engagement", pathname, 0, { type: "inactive" });
      }
    };

    // Set up event listeners for user activity
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];
    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // Check for inactivity every 30 seconds
    const inactivityCheck = setInterval(handleInactivity, 30000);

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      clearInterval(inactivityCheck);
    };
  }, [pathname, shouldTrack]);

  const trackEvent = async (event, page, duration = 0, metadata = {}) => {
    try {
      // Skip tracking based on utility function
      if (!shouldTrack) return;

      // Safely access user ID with fallback to anonymous
      const userId = user?._id || "anonymous";

      await fetch("/api/analytics/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          event,
          page,
          duration,
          metadata,
        }),
      }).catch((err) => console.log("Analytics API error:", err));
    } catch (error) {
      console.error("Failed to track analytics event:", error);
    }
  };

  return { trackEvent };
}
