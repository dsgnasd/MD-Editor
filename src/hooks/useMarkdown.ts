import { useState, useEffect, useCallback } from 'react';
import md from '../utils/markdownParser';

export const useMarkdown = (initialValue: string = '') => {
  const [value, setValue] = useState<string>(initialValue);
  const [preview, setPreview] = useState<string>('');

  const render = useCallback((txt: string) => {
    setPreview(md.render(txt));
  }, []);

  useEffect(() => {
    render(value);
  }, [value, render]);

  return { value, setValue, preview };
};
