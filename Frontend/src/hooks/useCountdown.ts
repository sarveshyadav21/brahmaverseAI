import { useState, useEffect, useCallback } from 'react';

export function useCountdown(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!isActive || seconds <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, seconds]);

  const reset = useCallback(
    (newSeconds = initialSeconds) => {
      setSeconds(newSeconds);
      setIsActive(true);
    },
    [initialSeconds]
  );

  return {
    seconds,
    isComplete: seconds === 0,
    reset,
  };
}
