import { useState, useEffect, useCallback } from 'react';
import { fonts, fontKey } from '../utils/constants';
import { FONT_SIZE } from '../utils/config';

export const usePreferences = () => {
  const [fontSize, setFontSizeState] = useState(() => {
    const saved = parseInt(
      localStorage.getItem('md-editor-fontsize') || String(FONT_SIZE.default),
      10,
    );
    return Math.min(Math.max(saved, FONT_SIZE.min), FONT_SIZE.max);
  });

  const [font, setFontState] = useState(() => localStorage.getItem(fontKey) || 'inter');
  const [minimalMode, setMinimalMode] = useState(false);

  const setFontSize = useCallback((size: number) => {
    setFontSizeState(Math.min(Math.max(size, FONT_SIZE.min), FONT_SIZE.max));
  }, []);

  const setFont = useCallback((id: string) => setFontState(id), []);

  useEffect(() => {
    localStorage.setItem('md-editor-fontsize', String(fontSize));
  }, [fontSize]);

  useEffect(() => {
    const fontObj = fonts.find((f) => f.id === font);
    if (fontObj) {
      document.body.style.fontFamily = fontObj.family;
      localStorage.setItem(fontKey, font);
    }
  }, [font]);

  return { fontSize, setFontSize, font, setFont, minimalMode, setMinimalMode };
};
