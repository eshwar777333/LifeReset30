import { useState, useEffect, useRef, useCallback } from 'react';

export interface TimerConfig {
  initialTime: number; // in seconds
  onComplete?: () => void;
  onTick?: (remaining: number) => void;
}

export function useTimer({ initialTime, onComplete, onTick }: TimerConfig) {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback(() => {
    setIsActive(true);
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const stop = useCallback(() => {
    setIsActive(false);
    setIsPaused(false);
    setTimeRemaining(initialTime);
  }, [initialTime]);

  const reset = useCallback(() => {
    setTimeRemaining(initialTime);
    setIsActive(false);
    setIsPaused(false);
  }, [initialTime]);

  useEffect(() => {
    if (isActive && !isPaused && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          const newTime = prev - 1;
          onTick?.(newTime);
          
          if (newTime <= 0) {
            setIsActive(false);
            onComplete?.();
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isPaused, timeRemaining, onComplete, onTick]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const getProgress = useCallback(() => {
    return ((initialTime - timeRemaining) / initialTime) * 100;
  }, [initialTime, timeRemaining]);

  return {
    timeRemaining,
    isActive,
    isPaused,
    start,
    pause,
    resume,
    stop,
    reset,
    formatTime: () => formatTime(timeRemaining),
    progress: getProgress(),
  };
}
