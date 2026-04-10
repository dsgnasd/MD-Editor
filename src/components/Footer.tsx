import { memo } from 'react';
import { usePreferencesContext } from '../context/PreferencesContext';

type FooterProps = {
  wordCount: number;
  onSwapPanels: () => void;
  onHelpOpen: () => void;
};

const formatWords = (count: number) =>
  count === 0 ? '0 words' : `${count} ${count === 1 ? 'word' : 'words'}`;

export const Footer = memo(({ wordCount, onSwapPanels, onHelpOpen }: FooterProps) => {
  const { minimalMode, tocVisible, setTocVisible } = usePreferencesContext();

  if (minimalMode) return null;

  return (
    <footer className="hidden sm:flex px-4 py-1 border-t border-stone-200 dark:border-white/5 bg-white/80 dark:bg-dark-primary/80 backdrop-blur-xl items-center justify-between">
      <div className="flex items-center gap-1">
        <button
          onClick={() => setTocVisible(!tocVisible)}
          aria-label="Toggle structure panel"
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all duration-200 ${
            tocVisible
              ? 'text-stone-800 dark:text-zinc-100 bg-stone-200/80 dark:bg-white/10'
              : 'text-stone-500 dark:text-zinc-400 hover:text-stone-700 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-white/5'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12M8.25 17.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          <span>Structure</span>
        </button>
        <button
          onClick={onSwapPanels}
          aria-label="Swap panels"
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-stone-500 dark:text-zinc-400 hover:text-stone-700 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-white/5 transition-all duration-200"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <span>Swap Panels</span>
        </button>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-stone-500 dark:text-zinc-400 px-2 tabular-nums font-medium">
          {formatWords(wordCount)}
        </span>
        <button
          onClick={onHelpOpen}
          className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-stone-500 dark:text-zinc-400 hover:text-stone-800 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-white/5 transition-all duration-200"
        >
          Markdown tips
        </button>
      </div>
    </footer>
  );
});
Footer.displayName = 'Footer';
