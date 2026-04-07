import { useEffect, useCallback, useRef, useState } from 'react';

type ImageMap = Map<string, string>;

type EditorProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  fontSize: number;
  images: ImageMap;
  onImageAdd: (name: string, dataUrl: string) => void;
  onImageRemove: (name: string) => void;
};

export const Editor = ({ value, onChange, fontSize, images, onImageAdd, onImageRemove }: EditorProps) => {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const historyRef = useRef<string[]>([value]);
  const historyIdxRef = useRef(0);
  const skipHistoryRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const pushHistory = useCallback((val: string) => {
    const idx = historyIdxRef.current;
    const hist = historyRef.current;
    if (hist.length > 0 && hist[idx] === val) return;
    hist.splice(idx + 1);
    hist.push(val);
    if (hist.length > 500) hist.splice(0, hist.length - 500);
    historyIdxRef.current = hist.length - 1;
  }, []);

  const setValue = useCallback((val: string, skipHistory = false) => {
    skipHistoryRef.current = skipHistory;
    onChange({ target: { value: val } } as React.ChangeEvent<HTMLTextAreaElement>);
  }, [onChange]);

  const insertAtCursor = useCallback((text: string) => {
    const ta = taRef.current;
    if (!ta) return;
    const s = ta.selectionStart;
    const before = value.substring(0, s);
    const after = value.substring(s);
    const newValue = before + text + after;
    setValue(newValue);
    pushHistory(newValue);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(s + text.length, s + text.length);
    });
  }, [value, setValue, pushHistory]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          const name = file.name || 'image.png';
          onImageAdd(name, reader.result as string);
          insertAtCursor(`\n![${name}]\n`);
        };
        reader.readAsDataURL(file);
        break;
      }
    }
  }, [insertAtCursor, onImageAdd]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer?.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
        onImageAdd(file.name, reader.result as string);
        insertAtCursor(`\n![${file.name}]\n`);
      };
      reader.readAsDataURL(file);
    });
  }, [insertAtCursor, onImageAdd]);

  const removeImage = useCallback((name: string) => {
    const regex = new RegExp(`!\\[${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]`, 'g');
    const newValue = value.replace(regex, '');
    setValue(newValue);
    pushHistory(newValue);
    onImageRemove(name);
  }, [value, setValue, pushHistory, onImageRemove]);

  const applyFormat = useCallback((marker: string) => {
    const ta = taRef.current;
    if (!ta) return;
    const s = ta.selectionStart;
    const e = ta.selectionEnd;
    const len = marker.length;

    if (s !== e) {
      const before = value.substring(0, s);
      const selected = value.substring(s, e);
      const after = value.substring(e);

      const hasWrap = before.length >= len && after.length >= len
        && before.slice(-len) === marker && after.slice(0, len) === marker;

      let newValue: string;
      let newStart: number;
      let newEnd: number;

      if (hasWrap) {
        newValue = before.slice(0, -len) + selected + after.slice(len);
        newStart = before.length - len;
        newEnd = before.length - len + selected.length;
      } else {
        newValue = before + marker + selected + marker + after;
        newStart = s + len;
        newEnd = s + len + selected.length;
      }

      setValue(newValue);
      pushHistory(newValue);
      requestAnimationFrame(() => {
        ta.focus();
        ta.setSelectionRange(newStart, newEnd);
      });
    } else {
      const before = value.substring(0, s);
      const after = value.substring(s);
      const beforeIdx = before.lastIndexOf(marker);
      const afterIdx = after.indexOf(marker);

      if (beforeIdx !== -1 && afterIdx !== -1) {
        const content = before.substring(beforeIdx + len) + after.substring(0, afterIdx);
        const newValue = before.substring(0, beforeIdx) + content + after.substring(afterIdx + len);
        setValue(newValue);
        pushHistory(newValue);
        requestAnimationFrame(() => {
          ta.focus();
          ta.setSelectionRange(beforeIdx, beforeIdx + content.length);
        });
      } else {
        const newValue = before + marker + marker + after;
        setValue(newValue);
        pushHistory(newValue);
        requestAnimationFrame(() => {
          ta.focus();
          ta.setSelectionRange(s + len, s + len);
        });
      }
    }
  }, [value, setValue, pushHistory]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;

      if (isMod && e.key === 'b') {
        e.preventDefault();
        applyFormat('**');
      } else if (isMod && e.key === 'i') {
        e.preventDefault();
        applyFormat('*');
      } else if (isMod && e.key === '`') {
        e.preventDefault();
        applyFormat('`');
      } else if (isMod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        const idx = historyIdxRef.current;
        if (idx > 0) {
          historyIdxRef.current = idx - 1;
          const prev = historyRef.current[idx - 1];
          setValue(prev, true);
        }
      } else if (isMod && (e.key === 'Z' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        const idx = historyIdxRef.current;
        if (idx < historyRef.current.length - 1) {
          historyIdxRef.current = idx + 1;
          const next = historyRef.current[idx + 1];
          setValue(next, true);
        }
      }
    };

    const ta = taRef.current;
    if (ta) {
      ta.addEventListener('keydown', handler);
    }
    return () => {
      if (ta) ta.removeEventListener('keydown', handler);
    };
  }, [applyFormat, setValue]);

  useEffect(() => {
    if (!skipHistoryRef.current) {
      pushHistory(value);
    }
    skipHistoryRef.current = false;
  }, [value, pushHistory]);

  const imageNames = Array.from(images.keys());

  return (
    <div
      ref={dropRef}
      className="w-full h-full overflow-auto relative flex flex-col"
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={(e) => {
        if (!dropRef.current?.contains(e.relatedTarget as Node)) setIsDragging(false);
      }}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-blue-500/5 dark:bg-blue-400/5 backdrop-blur-sm border-2 border-dashed border-blue-400/40 dark:border-blue-400/30 rounded-lg m-2 pointer-events-none">
          <div className="flex flex-col items-center gap-2 text-blue-400/70 dark:text-blue-400/60">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-medium">Перетащите изображение</span>
          </div>
        </div>
      )}
      <textarea
        ref={taRef}
        value={value}
        onChange={onChange}
        onPaste={handlePaste}
        className="w-full min-h-full px-10 py-6 font-mono leading-relaxed text-stone-700 dark:text-zinc-300 bg-transparent border-none resize-none outline-none placeholder:text-stone-300 dark:placeholder:text-zinc-600 selection:bg-blue-200 dark:selection:bg-blue-500/30"
        style={{ fontSize: `${fontSize}px` }}
        placeholder="Напишите markdown здесь..."
        spellCheck={false}
      />
      {imageNames.length > 0 && (
        <div className="px-10 py-3 border-t border-stone-200 dark:border-white/5 bg-stone-50/50 dark:bg-white/[0.02]">
          <div className="text-[11px] font-medium text-stone-400 dark:text-zinc-500 uppercase tracking-wider mb-2">Изображения</div>
          <div className="space-y-1">
            {imageNames.map((name) => (
              <div key={name} className="flex items-center gap-2 group">
                <svg className="w-4 h-4 text-stone-400 dark:text-zinc-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs text-stone-600 dark:text-zinc-400 truncate flex-1">{name}</span>
                <button
                  onClick={() => removeImage(name)}
                  className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded text-stone-400 hover:text-red-500 dark:hover:text-red-400 transition-all"
                  title="Удалить изображение"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
