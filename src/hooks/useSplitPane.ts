import { useState, useRef, useCallback, useEffect } from 'react';
import { SPLIT } from '../utils/config';

export const useSplitPane = () => {
  const [split, setSplit] = useState<number>(SPLIT.default);
  const [panelsSwapped, setPanelsSwapped] = useState(false);
  const [activePanel, setActivePanel] = useState<'editor' | 'preview'>('editor');
  const isDragging = useRef(false);

  const onDividerMouseDown = useCallback(() => {
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const main = document.querySelector('main');
      if (!main) return;
      const rect = main.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setSplit(Math.min(Math.max(pct, SPLIT.min), SPLIT.max));
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const toggleSwap = useCallback(() => setPanelsSwapped((p) => !p), []);
  const dividerLeft = `calc(${split}% - 22px)`;

  return { split, panelsSwapped, toggleSwap, activePanel, setActivePanel, onDividerMouseDown, dividerLeft };
};
