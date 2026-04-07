import { useEffect, useState, useCallback } from 'react';
import { storageKey } from '../utils/constants';

export const useAutosave = (value: string) => {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, value);
        setLastSaved(new Date());
      } catch (e) {
        console.warn('Не удалось сохранить в localStorage', e);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [value]);

  const save = useCallback(() => {
    try {
      localStorage.setItem(storageKey, value);
      setLastSaved(new Date());
    } catch (e) {
      console.warn('Не удалось сохранить в localStorage', e);
    }
  }, [value]);

  const download = useCallback(() => {
    const blob = new Blob([value], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'note.md';
    a.click();
    URL.revokeObjectURL(url);
  }, [value]);

  return { save, download, lastSaved };
};
