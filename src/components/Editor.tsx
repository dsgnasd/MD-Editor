import { memo, useEffect, useCallback, useRef } from 'react';
import { useUndoHistory } from '../hooks/useUndoHistory';
import { useEditorKeyboard } from '../hooks/useEditorKeyboard';

type EditorProps = {
  value: string;
  onChange: (val: string) => void;
  onCopied?: () => void;
};

export const Editor = memo(({ value, onChange, onCopied }: EditorProps) => {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const { pushHistory, undo, redo } = useUndoHistory(value, onChange);
  useEditorKeyboard(taRef, value, onChange, pushHistory, undo, redo);

  const handleCopy = useCallback(async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      onCopied?.();
    } catch {
      // Clipboard API unavailable — silently ignore
    }
  }, [value, onCopied]);

  useEffect(() => {
    const timer = setTimeout(() => taRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full h-full overflow-auto relative flex flex-col">
      {value.trim() && (
        <button
          onClick={handleCopy}
          aria-label="Copy markdown"
          className="absolute top-2 right-2 z-10 p-2.5 rounded-lg text-stone-300 dark:text-zinc-600 hover:text-stone-500 dark:hover:text-zinc-300 hover:bg-stone-100 dark:hover:bg-white/5 transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      )}
      <textarea
        ref={taRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-h-full px-4 sm:px-10 py-4 sm:py-6 font-mono leading-relaxed text-stone-700 dark:text-zinc-300 bg-transparent border-none resize-none outline-none placeholder:text-stone-400 dark:placeholder:text-zinc-500 selection:bg-blue-200 dark:selection:bg-blue-500/30"
        placeholder="Write your markdown here..."
        spellCheck={false}
      />
    </div>
  );
});
Editor.displayName = 'Editor';
