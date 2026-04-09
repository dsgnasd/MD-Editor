import { memo, useState } from 'react';
import { fonts } from '../utils/constants';
import { ThemeToggle } from './ThemeToggle';
import { usePreferencesContext } from '../context/PreferencesContext';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { FONT_SIZE } from '../utils/config';

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
  onNewNote: () => void;
  onDownload: () => void;
  onHelpOpen: () => void;
};

export const MobileMenu = memo(({ open, onClose, onNewNote, onDownload, onHelpOpen }: MobileMenuProps) => {
  const { fontSize, setFontSize, font, setFont } = usePreferencesContext();
  const [fontMenuOpen, setFontMenuOpen] = useState(false);

  useEscapeKey(onClose, open);

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-40 sm:hidden">
      <div className="absolute inset-0 bg-black/20 dark:bg-black/40" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 w-80 bg-white dark:bg-dark-tertiary shadow-2xl flex flex-col pt-20 pb-6 px-4 overflow-y-auto">
        <div className="space-y-1">
          <button
            onClick={() => { onNewNote(); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-4 rounded-xl text-sm text-stone-700 dark:text-zinc-200 hover:bg-stone-100 dark:hover:bg-white/5 transition-all h-14"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m-7-7h14" />
            </svg>
            New Note
          </button>

          <button
            onClick={() => { onDownload(); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-4 rounded-xl text-sm text-stone-700 dark:text-zinc-200 hover:bg-stone-100 dark:hover:bg-white/5 transition-all h-14"
          >
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download .md
          </button>

          <div className="h-px bg-stone-200 dark:bg-white/10 my-2" />

          <div className="flex items-center justify-between px-4 py-4 rounded-xl hover:bg-stone-100 dark:hover:bg-white/5 transition-all h-14">
            <span className="text-sm text-stone-700 dark:text-zinc-200">Theme</span>
            <ThemeToggle />
          </div>

          <div className="flex items-center justify-between px-4 py-4 rounded-xl hover:bg-stone-100 dark:hover:bg-white/5 transition-all h-14">
            <span className="text-sm text-stone-700 dark:text-zinc-200">Font Size</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFontSize(fontSize - 1)}
                disabled={fontSize <= FONT_SIZE.min}
                aria-label="Decrease font size"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-base text-stone-600 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
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
                className="w-8 h-8 rounded-lg flex items-center justify-center text-base text-stone-600 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
          </div>

          <button
            onClick={() => setFontMenuOpen(!fontMenuOpen)}
            className="w-full flex items-center justify-between px-4 py-4 rounded-xl hover:bg-stone-100 dark:hover:bg-white/5 transition-all h-14"
          >
            <span className="text-sm text-stone-700 dark:text-zinc-200">Font</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-stone-600 dark:text-zinc-400">
                {fonts.find((f) => f.id === font)?.label}
              </span>
              <svg
                className={`w-4 h-4 text-stone-400 transition-transform ${fontMenuOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {fontMenuOpen && (
            <div className="px-2 pb-2 space-y-1">
              {fonts.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFont(f.id)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm hover:bg-stone-100 dark:hover:bg-white/5 transition-all"
                >
                  <span
                    className="w-10 h-10 rounded-lg bg-stone-100 dark:bg-white/5 flex items-center justify-center text-xs font-semibold text-stone-700 dark:text-zinc-300"
                    style={{ fontFamily: f.family }}
                  >
                    Aa
                  </span>
                  <span className="text-stone-700 dark:text-zinc-200" style={{ fontFamily: f.family }}>
                    {f.label}
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="h-px bg-stone-200 dark:bg-white/10 my-2" />

          <button
            onClick={() => { onHelpOpen(); onClose(); }}
            className="w-full px-4 py-4 rounded-xl text-sm text-stone-700 dark:text-zinc-200 hover:bg-stone-100 dark:hover:bg-white/5 transition-all text-left h-14"
          >
            Markdown Tips
          </button>

          <div className="mt-4 pt-4 border-t border-stone-200 dark:border-white/10">
            <p className="text-sm text-stone-500 dark:text-zinc-400 text-center">
              Simple Markdown editor for fast writing and clean preview
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});
MobileMenu.displayName = 'MobileMenu';
