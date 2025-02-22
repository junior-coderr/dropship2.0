import { useState, useEffect } from "react";

export const useCountdown = (initialMinutes = 30) => {
  const [minutes, setMinutes] = useState(initialMinutes);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      }
      if (seconds === 0) {
        if (minutes === 0) {
          setMinutes(initialMinutes);
          setSeconds(0);
        } else {
          setMinutes(minutes - 1);
          setSeconds(59);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [seconds, minutes, initialMinutes]);

  return { minutes, seconds };
};
