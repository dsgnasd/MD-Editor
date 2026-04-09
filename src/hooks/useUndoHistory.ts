import { useRef, useCallback, useEffect } from 'react';
import { MAX_HISTORY } from '../utils/config';

export const useUndoHistory = (
  value: string,
  onChange: (val: string) => void,
) => {
  const historyRef = useRef<string[]>([value]);
  const historyIdxRef = useRef(0);
  const skipRef = useRef(false);

  const pushHistory = useCallback((val: string) => {
    const idx = historyIdxRef.current;
    const hist = historyRef.current;
    if (hist[idx] === val) return;
    hist.splice(idx + 1);
    hist.push(val);
    if (hist.length > MAX_HISTORY) hist.splice(0, hist.length - MAX_HISTORY);
    historyIdxRef.current = hist.length - 1;
  }, []);

  const undo = useCallback(() => {
    const idx = historyIdxRef.current;
    if (idx > 0) {
      historyIdxRef.current = idx - 1;
      skipRef.current = true;
      onChange(historyRef.current[idx - 1]);
    }
  }, [onChange]);

  const redo = useCallback(() => {
    const idx = historyIdxRef.current;
    if (idx < historyRef.current.length - 1) {
      historyIdxRef.current = idx + 1;
      skipRef.current = true;
      onChange(historyRef.current[idx + 1]);
    }
  }, [onChange]);

  useEffect(() => {
    if (!skipRef.current) pushHistory(value);
    skipRef.current = false;
  }, [value, pushHistory]);

  return { pushHistory, undo, redo };
};
