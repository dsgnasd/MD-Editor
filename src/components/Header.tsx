import { memo } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { FontSelector } from './FontSelector';
import { usePreferencesContext } from '../context/PreferencesContext';
import { FONT_SIZE } from '../utils/config';

type HeaderProps = {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  onNewNote: () => void;
  onDownload: () => void;
};

export const Header = memo(({ menuOpen, setMenuOpen, onNewNote, onDownload }: HeaderProps) => {
  const { fontSize, setFontSize, font, setFont, minimalMode, setMinimalMode } = usePreferencesContext();

  if (minimalMode) {
    return (
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-2 border-b border-stone-200 dark:border-white/5 bg-white/80 dark:bg-dark-primary/80 backdrop-blur-xl">
        <div className="flex flex-col shrink-0 invisible" aria-hidden="true">
          <h1 className="text-lg font-semibold text-stone-800 dark:text-zinc-100 tracking-tight whitespace-nowrap">MD Persona</h1>
          <span className="hidden lg:block text-xs text-stone-500 dark:text-zinc-400 mt-0.5">Simple Markdown editor for fast writing and clean preview</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="invisible w-10 h-10" aria-hidden="true" />
          <button
            onClick={() => setMinimalMode(false)}
            aria-label="Exit minimal mode"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm opacity-25 hover:opacity-80 transition-opacity duration-200 text-stone-600 dark:text-zinc-300 hover:bg-stone-100/60 dark:hover:bg-white/5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
            <span className="hidden sm:inline">Minimal</span>
          </button>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-2 border-b border-stone-200 dark:border-white/5 bg-white/80 dark:bg-dark-primary/80 backdrop-blur-xl">
      <div className="flex flex-col shrink-0">
        <h1 className="text-lg font-semibold text-stone-800 dark:text-zinc-100 tracking-tight whitespace-nowrap">
          MD Persona
        </h1>
        <span className="hidden lg:block text-xs text-stone-500 dark:text-zinc-400 mt-0.5">
          Simple Markdown editor for fast writing and clean preview
        </span>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onNewNote}
          aria-label="New Note"
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-stone-600 dark:text-zinc-300 hover:text-stone-900 dark:hover:text-zinc-100 hover:bg-stone-100 dark:hover:bg-white/5 transition-all duration-200"
        >
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span className="hidden sm:inline">New Note</span>
        </button>

        <button
          onClick={onDownload}
          aria-label="Download .md"
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-stone-600 dark:text-zinc-300 hover:text-stone-900 dark:hover:text-zinc-100 hover:bg-stone-100 dark:hover:bg-white/5 transition-all duration-200"
        >
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          <span className="hidden sm:inline">Download</span>
        </button>

        <div className="hidden sm:block w-px h-4 bg-stone-200 dark:bg-white/10 mx-1" />

        <div className="hidden sm:flex items-center gap-1">
          <ThemeToggle />
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setFontSize(fontSize - 1)}
              disabled={fontSize <= FONT_SIZE.min}
              aria-label="Decrease font size"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-base text-stone-600 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              −
            </button>
            <span className="w-6 text-center text-sm font-medium text-stone-800 dark:text-zinc-100">
              {fontSize}
            </span>
            <button
              onClick={() => setFontSize(fontSize + 1)}
              disabled={fontSize >= FONT_SIZE.max}
              aria-label="Increase font size"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-base text-stone-600 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              +
            </button>
          </div>
          <FontSelector font={font} onFontChange={setFont} />
        </div>

        <div className="hidden sm:block w-px h-4 bg-stone-200 dark:bg-white/10 mx-1" />

        <button
          onClick={() => setMinimalMode(true)}
          aria-label="Enter minimal mode"
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-stone-600 dark:text-zinc-300 hover:text-stone-900 dark:hover:text-zinc-100 hover:bg-stone-100 dark:hover:bg-white/5 transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span className="hidden sm:inline">Minimal</span>
        </button>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          className="sm:hidden w-9 h-9 rounded-xl flex items-center justify-center text-stone-600 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-white/5 transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>
    </header>
  );
});
Header.displayName = 'Header';
