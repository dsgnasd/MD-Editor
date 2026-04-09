import { memo } from 'react';

type DividerProps = {
  left: string;
  onMouseDown: () => void;
};

export const Divider = memo(({ left, onMouseDown }: DividerProps) => (
  <div
    onMouseDown={onMouseDown}
    className="absolute cursor-col-resize z-10 items-center justify-center group hidden sm:flex"
    style={{ left, top: 0, bottom: 0, width: '44px' }}
  >
    <div className="w-px h-8 bg-stone-300 dark:bg-white/10 group-hover:h-10 transition-all rounded-full" />
  </div>
));
Divider.displayName = 'Divider';
