import { memo } from 'react';

type ToastProps = {
  visible: boolean;
  fading: boolean;
  message: string;
};

export const Toast = memo(({ visible, fading, message }: ToastProps) => {
  if (!visible) return null;
  return (
    <div
      className={`fixed bottom-16 left-1/2 transform -translate-x-1/2 px-4 py-2.5 bg-stone-900/90 dark:bg-zinc-100/90 text-white dark:text-zinc-900 text-sm font-medium rounded-full shadow-xl backdrop-blur-sm border border-white/10 dark:border-zinc-200/20 transition-all duration-300 ${
        fading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {message}
    </div>
  );
});
Toast.displayName = 'Toast';
