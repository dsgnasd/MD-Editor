import { useState, useEffect } from 'react';
import { MOBILE_BREAKPOINT } from '../utils/config';

export const useIsMobile = (breakpoint = MOBILE_BREAKPOINT): boolean => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < breakpoint);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [breakpoint]);

  return isMobile;
};
