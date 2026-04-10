import { memo, useEffect, useCallback, useRef, useState } from 'react';
import { useUndoHistory } from '../hooks/useUndoHistory';
import { useEditorKeyboard } from '../hooks/useEditorKeyboard';
import { DropZone } from './DropZone';
import { DEFAULT_NOTE_CONTENT } from '../utils/config';

type EditorProps = {
  value: string;
  onChange: (val: string) => void;
  onCopied?: () => void;
  hideCopy?: boolean;
};

export const Editor = memo(({ value, onChange, onCopied, hideCopy }: EditorProps) => {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const { pushHistory, undo, redo } = useUndoHistory(value, onChange);
  useEditorKeyboard(taRef, value, onChange, pushHistory, undo, redo);

  const isEmpty = !value.trim();
  const isDefault = value === DEFAULT_NOTE_CONTENT;
  const shouldShowDropZone = isEmpty || isDefault;

  const [dropZoneState, setDropZoneState] = useState<'expanded' | 'collapsing' | 'collapsed'>(
    shouldShowDropZone ? 'expanded' : 'collapsed',
  );
  const prevShouldShow = useRef(shouldShowDropZone);

  useEffect(() => {
    if (prevShouldShow.current && !shouldShowDropZone) {
      setDropZoneState('collapsing');
    } else if (!prevShouldShow.current && shouldShowDropZone) {
      setDropZoneState('expanded');
    }
    prevShouldShow.current = shouldShowDropZone;
  }, [shouldShowDropZone]);

  const handleCopy = useCallback(async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      onCopied?.();
    } catch {
      // Clipboard API unavailable
    }
  }, [value, onCopied]);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) onChange(text);
    } catch {
      // Clipboard API unavailable
    }
  }, [onChange]);

  useEffect(() => {
    const timer = setTimeout(() => taRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  const showDropZone = dropZoneState === 'expanded' || dropZoneState === 'collapsing';
  const showPasteButton = dropZoneState === 'collapsed' && !isEmpty;

  return (
    <div className="w-full h-full overflow-auto relative flex flex-col">
      {showDropZone && (
        <DropZone
          onContent={onChange}
          collapsing={dropZoneState === 'collapsing'}
          onCollapsed={() => setDropZoneState('collapsed')}
        />
      )}
      <div className="relative flex-1">
        {!isEmpty && !hideCopy && (
          <div className="absolute top-2 right-2 z-10 flex items-center gap-0.5">
            {showPasteButton && (
              <button
                onClick={handlePaste}
                aria-label="Paste from clipboard"
                className="p-2.5 rounded-lg text-stone-300 dark:text-zinc-600 hover:text-stone-500 dark:hover:text-zinc-300 hover:bg-stone-100 dark:hover:bg-white/5 transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                  />
                </svg>
              </button>
            )}
            <button
              onClick={handleCopy}
              aria-label="Copy markdown"
              className="p-2.5 rounded-lg text-stone-300 dark:text-zinc-600 hover:text-stone-500 dark:hover:text-zinc-300 hover:bg-stone-100 dark:hover:bg-white/5 transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
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
    </div>
  );
});
Editor.displayName = 'Editor';
