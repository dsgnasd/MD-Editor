import { useCallback } from 'react';

export const useAutosave = (value: string) => {
  const download = useCallback(() => {
    const firstLine = value.split('\n')[0]?.replace(/^[#\s]+/, '').trim() || 'note';
    const safeName = firstLine.replace(/[<>:"/\\|?*]/g, '').slice(0, 50) || 'note';
    const blob = new Blob([value], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeName}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [value]);

  return { download };
};