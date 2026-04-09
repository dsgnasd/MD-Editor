import { useEffect, useCallback, useRef } from 'react';

type EditorProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  fontSize: number;
  onCopied?: () => void;
};

export const Editor = ({ value, onChange, fontSize, onCopied }: EditorProps) => {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const historyRef = useRef<string[]>([value]);
  const historyIdxRef = useRef(0);
  const skipHistoryRef = useRef(false);

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

  const handleCopy = useCallback(async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      onCopied?.();
    } catch (err) {
      console.error('Clipboard write failed:', err);
    }
  }, [value, onCopied]);

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
      } else if (e.key === 'Enter' && !isMod) {
        const ta = taRef.current;
        if (!ta) return;
        const s = ta.selectionStart;
        const lineStart = value.lastIndexOf('\n', s - 1) + 1;
        const line = value.substring(lineStart, s);
        const bulletMatch = line.match(/^(\s*)([-*+]|\d+\.)\s/);
        if (bulletMatch) {
          e.preventDefault();
          const [, indent, marker] = bulletMatch;
          let nextMarker = marker;
          if (/\d+\./.test(marker)) {
            const num = parseInt(marker, 10) + 1;
            nextMarker = `${num}.`;
          }
          const insertion = `\n${indent}${nextMarker} `;
          const before = value.substring(0, s);
          const after = value.substring(s);
          const newValue = before + insertion + after;
          setValue(newValue);
          pushHistory(newValue);
          requestAnimationFrame(() => {
            ta.focus();
            ta.setSelectionRange(s + insertion.length, s + insertion.length);
          });
        }
      } else if (e.key === 'Tab' && !isMod) {
        const ta = taRef.current;
        if (!ta) return;
        const s = ta.selectionStart;
        const lineStart = value.lastIndexOf('\n', s - 1) + 1;
        const line = value.substring(lineStart, s);
        const bulletMatch = line.match(/^(\s*)([-*+]|\d+\.)\s/);
        if (bulletMatch) {
          e.preventDefault();
          const [, indent, marker] = bulletMatch;
          let newIndent = indent;
          if (e.shiftKey) {
            if (indent.length >= 2) {
              newIndent = indent.slice(0, -2);
            } else if (indent.length === 1) {
              newIndent = '';
            }
          } else {
            if (indent.length < 8) {
              newIndent = indent + '  ';
            }
          }
          const fullLineStart = lineStart;
          const fullLineEnd = lineStart + line.length;
          const before = value.substring(0, fullLineStart);
          const after = value.substring(fullLineEnd);
          const newLine = `${newIndent}${marker} `;
          const newValue = before + newLine + after;
          setValue(newValue);
          pushHistory(newValue);
          requestAnimationFrame(() => {
            ta.focus();
            ta.setSelectionRange(fullLineStart + newLine.length, fullLineStart + newLine.length);
          });
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
  }, [applyFormat, setValue, value, pushHistory]);

  useEffect(() => {
    const timer = setTimeout(() => {
      taRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!skipHistoryRef.current) {
      pushHistory(value);
    }
    skipHistoryRef.current = false;
  }, [value, pushHistory]);

  return (
    <div className="w-full h-full overflow-auto relative flex flex-col">
      {value.trim() && (
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 z-10 p-2.5 rounded-lg text-stone-300 dark:text-zinc-600 hover:text-stone-500 dark:hover:text-zinc-300 hover:bg-stone-100 dark:hover:bg-white/5 transition-all"
          title="Copy markdown"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      )}
      <textarea
        ref={taRef}
        value={value}
        onChange={onChange}
        className="w-full min-h-full px-4 sm:px-10 py-4 sm:py-6 font-mono leading-relaxed text-stone-700 dark:text-zinc-300 bg-transparent border-none resize-none outline-none placeholder:text-stone-400 dark:placeholder:text-zinc-500 selection:bg-blue-200 dark:selection:bg-blue-500/30"
        style={{ fontSize: `${fontSize}px` }}
        placeholder="Write your markdown here..."
        spellCheck={false}
      />
    </div>
  );
};
