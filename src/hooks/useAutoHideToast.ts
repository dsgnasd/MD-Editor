import { useState, useEffect } from 'react';

export const useAutoHideToast = (
  trigger: boolean,
  fadeMs: number,
  removeMs: number,
): { rendered: boolean; visible: boolean } => {
  const [rendered, setRendered] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!trigger) return;
    setRendered(true);
    setVisible(true);
    const fadeOut = setTimeout(() => setVisible(false), fadeMs);
    const remove = setTimeout(() => setRendered(false), removeMs);
    return () => {
      clearTimeout(fadeOut);
      clearTimeout(remove);
    };
  }, [trigger, fadeMs, removeMs]);

  return { rendered, visible };
};
