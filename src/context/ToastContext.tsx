import { createContext, useContext, useState, useRef, useCallback, useMemo, ReactNode } from 'react';
import { TOAST } from '../utils/config';

type ToastContextValue = {
  showToast: (message: string) => void;
  toastVisible: boolean;
  toastFading: boolean;
  toastMessage: string;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const removeTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const showToast = useCallback((msg: string) => {
    clearTimeout(fadeTimerRef.current);
    clearTimeout(removeTimerRef.current);
    setMessage(msg);
    setVisible(true);
    setFading(false);
    fadeTimerRef.current = setTimeout(() => setFading(true), TOAST.fadeMs);
    removeTimerRef.current = setTimeout(() => setVisible(false), TOAST.removeMs);
  }, []);

  const value = useMemo(
    () => ({ showToast, toastVisible: visible, toastFading: fading, toastMessage: message }),
    [showToast, visible, fading, message],
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
};

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
