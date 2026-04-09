import { RefObject, useEffect } from 'react';
import { applyFormat, continueBullet, indentBullet } from '../utils/editorCommands';

export const useEditorKeyboard = (
  taRef: RefObject<HTMLTextAreaElement | null>,
  value: string,
  onChange: (val: string) => void,
  pushHistory: (val: string) => void,
  undo: () => void,
  redo: () => void,
): void => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ta = taRef.current;
      if (!ta) return;
      const isMod = e.metaKey || e.ctrlKey;

      const applyAndSelect = (newValue: string, newStart: number, newEnd: number) => {
        onChange(newValue);
        pushHistory(newValue);
        requestAnimationFrame(() => {
          ta.focus();
          ta.setSelectionRange(newStart, newEnd);
        });
      };

      if (isMod && e.key === 'b') {
        e.preventDefault();
        const r = applyFormat(value, ta.selectionStart, ta.selectionEnd, '**');
        applyAndSelect(r.newValue, r.newStart, r.newEnd);
      } else if (isMod && e.key === 'i') {
        e.preventDefault();
        const r = applyFormat(value, ta.selectionStart, ta.selectionEnd, '*');
        applyAndSelect(r.newValue, r.newStart, r.newEnd);
      } else if (isMod && e.key === '`') {
        e.preventDefault();
        const r = applyFormat(value, ta.selectionStart, ta.selectionEnd, '`');
        applyAndSelect(r.newValue, r.newStart, r.newEnd);
      } else if (isMod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (isMod && (e.key === 'Z' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      } else if (e.key === 'Enter' && !isMod) {
        const r = continueBullet(value, ta.selectionStart);
        if (r) {
          e.preventDefault();
          onChange(r.newValue);
          pushHistory(r.newValue);
          requestAnimationFrame(() => {
            ta.focus();
            ta.setSelectionRange(r.newSelEnd, r.newSelEnd);
          });
        }
      } else if (e.key === 'Tab' && !isMod) {
        const r = indentBullet(value, ta.selectionStart, e.shiftKey);
        if (r) {
          e.preventDefault();
          onChange(r.newValue);
          pushHistory(r.newValue);
          requestAnimationFrame(() => {
            ta.focus();
            ta.setSelectionRange(r.newSelEnd, r.newSelEnd);
          });
        }
      }
    };

    const ta = taRef.current;
    if (ta) ta.addEventListener('keydown', handler);
    return () => {
      if (ta) ta.removeEventListener('keydown', handler);
    };
  }, [taRef, value, onChange, pushHistory, undo, redo]);
};
