import { memo, useState, useCallback, useRef } from 'react';

type DropZoneProps = {
  onContent: (content: string) => void;
  collapsing?: boolean;
  onCollapsed?: () => void;
};

export const DropZone = memo(({ onContent, collapsing, onCollapsed }: DropZoneProps) => {
  const [dragging, setDragging] = useState(false);
  const dragCounter = useRef(0);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) setDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragging(false);
      dragCounter.current = 0;

      const file = e.dataTransfer.files[0];
      if (file && (file.name.endsWith('.md') || file.name.endsWith('.txt') || file.type.startsWith('text/'))) {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') onContent(reader.result);
        };
        reader.readAsText(file);
      }
    },
    [onContent],
  );

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) onContent(text);
    } catch {
      // Clipboard API unavailable
    }
  }, [onContent]);

  return (
    <div
      onTransitionEnd={(e) => {
        if (collapsing && e.propertyName === 'max-height') onCollapsed?.();
      }}
      className={`overflow-hidden transition-all duration-400 ease-in-out ${
        collapsing ? 'max-h-0 opacity-0 mt-0 mx-4 sm:mx-10' : 'max-h-80 opacity-100'
      }`}
    >
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center gap-3 mx-4 sm:mx-10 mt-4 sm:mt-6 px-6 py-6 sm:py-9 rounded-xl border-2 border-dashed transition-colors duration-200 ${
          dragging
            ? 'border-stone-400 dark:border-zinc-400 bg-stone-100/50 dark:bg-white/5'
            : 'border-stone-200 dark:border-white/10 bg-transparent'
        }`}
      >
        <svg
          className="w-10 h-10 text-stone-300 dark:text-zinc-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3v11.25"
          />
        </svg>
        <p className="text-sm text-stone-400 dark:text-zinc-500 text-center">
          Drag & drop markdown files, or
        </p>
        <button
          onClick={handlePaste}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-stone-600 dark:text-zinc-300 bg-stone-100 dark:bg-white/5 hover:bg-stone-200 dark:hover:bg-white/10 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
            />
          </svg>
          Paste from clipboard
        </button>
      </div>
    </div>
  );
});
DropZone.displayName = 'DropZone';
