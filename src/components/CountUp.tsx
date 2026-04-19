import { useEffect, useState, useRef } from 'react';

interface CountUpProps {
  value: number;
  duration?: number;
  decimals?: number;
  formatter?: (v: number) => string;
}

export default function CountUp({ 
  value, 
  duration = 1000, 
  decimals = 0,
  formatter
}: CountUpProps) {
  const defaultFormatter = (v: number) => {
    return v.toLocaleString('id-ID', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  const activeFormatter = formatter || defaultFormatter;
  const [displayValue, setDisplayValue] = useState(0);
  const startTimestamp = useRef<number | null>(null);
  const startValue = useRef(0);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    // Reset animation when value changes
    startTimestamp.current = null;
    startValue.current = displayValue;
    
    const animate = (timestamp: number) => {
      if (!startTimestamp.current) startTimestamp.current = timestamp;
      
      const progress = Math.min((timestamp - startTimestamp.current) / duration, 1);
      
      // Easing function: easeOutQuart
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      
      const nextValue = startValue.current + (value - startValue.current) * easeProgress;
      setDisplayValue(nextValue);

      if (progress < 1) {
        rafId.current = requestAnimationFrame(animate);
      }
    };

    rafId.current = requestAnimationFrame(animate);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [value, duration]);

  return <>{activeFormatter(displayValue)}</>;
}
