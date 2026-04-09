import { useEffect } from 'react';

export const useBodyScrollLock = (active: boolean): void => {
  useEffect(() => {
    document.body.style.overflow = active ? 'auto' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [active]);
};
