import { useState, useCallback, useEffect, useRef } from 'react';

type ContextMenuProps = {
  pos: { x: number; y: number } | null;
  selection: { start: number; end: number };
  onClose: () => void;
  onChange: (value: string) => void;
  getValue: () => string;
};

const Btn = ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
  <button
    onMouseDown={(e) => e.stopPropagation()}
    onClick={onClick}
    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-stone-600 dark:text-zinc-300 hover:text-stone-900 dark:hover:text-zinc-100 hover:bg-stone-100 dark:hover:bg-white/5 transition"
  >
    {children}
  </button>
);

export const ContextMenu = ({ pos, selection, onClose, onChange, getValue }: ContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);

  const wrap = useCallback((start: string, end: string = start) => {
    const value = getValue();
    const before = value.substring(0, selection.start);
    const selected = value.substring(selection.start, selection.end);
    const after = value.substring(selection.end);
    onChange(before + start + selected + end + after);
    onClose();
  }, [getValue, onChange, onClose, selection]);

  const insertAtCursor = useCallback((text: string) => {
    const value = getValue();
    const before = value.substring(0, selection.start);
    const selected = value.substring(selection.start, selection.end);
    const after = value.substring(selection.end);
    onChange(before + text + selected + after);
    onClose();
  }, [getValue, onChange, onClose, selection]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  if (!pos) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-[150] bg-white dark:bg-zinc-900 border border-stone-200 dark:border-white/10 rounded-xl shadow-xl p-1.5 min-w-[180px]"
      style={{ left: pos.x, top: pos.y }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col gap-0.5">
        <Btn onClick={() => wrap('**', '**')}>
          <span className="font-bold w-5 text-center">B</span> Жирный
        </Btn>
        <Btn onClick={() => wrap('*', '*')}>
          <span className="italic w-5 text-center">I</span> Курсив
        </Btn>
        <Btn onClick={() => wrap('`', '`')}>
          <span className="font-mono text-xs w-5 text-center">&lt;&gt;</span> Код
        </Btn>
        <div className="h-px bg-stone-100 dark:bg-white/5 my-1" />
        <Btn onClick={() => wrap('# ', '\n')}>
          <span className="font-bold text-xs w-5 text-center">H</span> Заголовок
        </Btn>
        <Btn onClick={() => insertAtCursor('- ')}>
          <span className="text-xs w-5 text-center">•</span> Список
        </Btn>
        <Btn onClick={() => insertAtCursor('> ')}>
          <span className="text-xs w-5 text-center">❝</span> Цитата
        </Btn>
        <div className="h-px bg-stone-100 dark:bg-white/5 my-1" />
        <Btn onClick={() => insertAtCursor('\n---\n')}>
          <span className="text-xs w-5 text-center">─</span> Линия
        </Btn>
      </div>
    </div>
  );
};
