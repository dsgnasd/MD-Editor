import { FC } from 'react';
import { fonts, fontKey } from '../utils/constants';
import { ThemeToggle } from './ThemeToggle';
import { FontSelector } from './FontSelector';

type HeaderProps = {
  fontSize: number;
  setFontSize: (size: number) => void;
  font: string;
  setFont: (font: string) => void;
  minimalMode: boolean;
  setMinimalMode: (mode: boolean) => void;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  onNewNote: () => void;
  onDownload: () => void;
};

export const Header: FC<HeaderProps> = ({
  fontSize,
  setFontSize,
  font,
  setFont,
  minimalMode,
  setMinimalMode,
  menuOpen,
  setMenuOpen,
  onNewNote,
  onDownload,
}) => {
  return (
    <header className={`sticky top-0 z-50 flex items-center justify-between px-4 py-2 border-b border-stone-200 dark:border-white/5 bg-white/80 dark:bg-dark-primary/80 backdrop-blur-xl ${minimalMode ? 'hidden' : ''}`}>
      <div className="flex flex-col shrink-0">
        <h1 className="text-lg font-semibold text-stone-800 dark:text-zinc-100 tracking-tight whitespace-nowrap">MD Persona</h1>
        <span className="hidden lg:block text-xs text-stone-500 dark:text-zinc-400 mt-0.5">Simple Markdown editor for fast writing and clean preview</span>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onNewNote}
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-stone-600 dark:text-zinc-300 hover:text-stone-900 dark:hover:text-zinc-100 hover:bg-stone-100 dark:hover:bg-white/5 transition-all duration-200"
          title="New Note"
        >
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span className="hidden sm:inline">New Note</span>
        </button>

        <button
          onClick={onDownload}
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-stone-600 dark:text-zinc-300 hover:text-stone-900 dark:hover:text-zinc-100 hover:bg-stone-100 dark:hover:bg-white/5 transition-all duration-200"
          title="Download .md"
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
              onClick={() => setFontSize(Math.max(14, fontSize - 1))}
              disabled={fontSize <= 14}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-base text-stone-600 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Decrease font size"
            >
              −
            </button>
            <span className="w-6 text-center text-sm font-medium text-stone-800 dark:text-zinc-100">{fontSize}</span>
            <button
              onClick={() => setFontSize(Math.min(18, fontSize + 1))}
              disabled={fontSize >= 18}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-base text-stone-600 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Increase font size"
            >
              +
            </button>
          </div>
          <FontSelector font={font} onFontChange={setFont} />
        </div>

        <div className="hidden sm:block w-px h-4 bg-stone-200 dark:bg-white/10 mx-1" />

        <button
          onClick={() => setMinimalMode(!minimalMode)}
          className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all duration-200 ${
            minimalMode 
              ? 'bg-stone-800 dark:bg-zinc-100 text-white dark:text-zinc-900' 
              : 'text-stone-600 dark:text-zinc-300 hover:text-stone-900 dark:hover:text-zinc-100 hover:bg-stone-100 dark:hover:bg-white/5'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span className="hidden sm:inline">Minimal</span>
        </button>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
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
};