import { useState, useEffect } from 'react';
import UnderDevelopment from '../components/UnderDevelopment';

export default function PredictiveAnalytics() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`h-full w-full ${mounted ? 'ews-animate-fade-in' : 'opacity-0'}`}>
      <UnderDevelopment />
    </div>
  );
}
