import { createContext, useContext, ReactNode } from 'react';
import { usePreferences } from '../hooks/usePreferences';

type PreferencesContextValue = ReturnType<typeof usePreferences>;

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export const PreferencesProvider = ({ children }: { children: ReactNode }) => {
  const value = usePreferences();
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
};

export const usePreferencesContext = (): PreferencesContextValue => {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferencesContext must be used within PreferencesProvider');
  return ctx;
};
