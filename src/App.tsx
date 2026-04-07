import { useState, useCallback, useRef, useEffect } from 'react';
import { useAutosave } from './hooks/useAutosave';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { FontSelector } from './components/FontSelector';
import { ThemeToggle } from './components/ThemeToggle';
import { HelpDialog } from './components/HelpDialog';
import { storageKey } from './utils/constants';

export const App = () => {
  const [value, setValue] = useState(() => {
    return localStorage.getItem(storageKey) || '';
  });
  const [split, setSplit] = useState(50);
  const [panelsSwapped, setPanelsSwapped] = useState(false);
  const [activePanel, setActivePanel] = useState<'editor' | 'preview'>('editor');
  const [fontSize, setFontSize] = useState(() => {
    const saved = parseInt(localStorage.getItem('md-editor-fontsize') || '16', 10);
    return Math.min(Math.max(saved, 14), 18);
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const isDragging = useRef(false);
  const { download } = useAutosave(value);

  useEffect(() => {
    localStorage.setItem('md-editor-fontsize', String(fontSize));
  }, [fontSize]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  const handleMouseDown = useCallback(() => {
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const main = document.querySelector('main');
      if (!main) return;
      const rect = main.getBoundingClientRect();
      const percent = ((e.clientX - rect.left) / rect.width) * 100;
      setSplit(Math.min(Math.max(percent, 20), 80));
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const wordCount = value.trim() === '' ? 0 : value.trim().split(/\s+/).length;

  const formatWords = (count: number) => {
    if (count === 0) return '0 слов';
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return `${count} слов`;
    if (lastDigit === 1) return `${count} слово`;
    if (lastDigit >= 2 && lastDigit <= 4) return `${count} слова`;
    return `${count} слов`;
  };

  return (
    <div className="flex flex-col h-screen bg-stone-50 dark:bg-[#0e0e10] transition-colors duration-300">
      <header className="relative z-50 flex items-center justify-between px-5 py-3 border-b border-stone-200 dark:border-white/5 bg-white/80 dark:bg-[#0e0e10]/80 backdrop-blur-xl">
        <h1 className="text-lg font-semibold text-stone-800 dark:text-zinc-100 tracking-tight">MD‑Editor</h1>
        <div className="flex items-center gap-1">
          <div className="hidden sm:flex items-center gap-0.5 mr-1">
            <button
              onClick={() => setFontSize(Math.max(14, fontSize - 1))}
              disabled={fontSize <= 14}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-stone-600 dark:text-zinc-300 hover:text-stone-900 dark:hover:text-zinc-100 hover:bg-stone-100 dark:hover:bg-white/5 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Уменьшить шрифт"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
              </svg>
            </button>
            <span className="w-7 text-center text-xs text-stone-600 dark:text-zinc-300 tabular-nums select-none font-medium">{fontSize}</span>
            <button
              onClick={() => setFontSize(Math.min(18, fontSize + 1))}
              disabled={fontSize >= 18}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-stone-600 dark:text-zinc-300 hover:text-stone-900 dark:hover:text-zinc-100 hover:bg-stone-100 dark:hover:bg-white/5 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Увеличить шрифт"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m-7-7h14" />
              </svg>
            </button>
          </div>

          <div className="hidden sm:block w-px h-4 bg-stone-200 dark:bg-white/10 mx-1" />

          <button
            onClick={download}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-stone-600 dark:text-zinc-300 hover:text-stone-900 dark:hover:text-zinc-100 hover:bg-stone-100 dark:hover:bg-white/5 transition-all duration-200"
            title="Скачать .md"
          >
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span className="hidden sm:inline">Скачать</span>
          </button>

          <div className="hidden sm:block w-px h-4 bg-stone-200 dark:bg-white/10 mx-1" />

          <div className="hidden sm:flex items-center gap-1">
            <ThemeToggle />
            <FontSelector />
          </div>

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

      <div className="sm:hidden flex items-center justify-center gap-2 px-4 py-2 border-b border-stone-200 dark:border-white/5 bg-white/60 dark:bg-[#0e0e10]/60 backdrop-blur-sm">
        <button
          onClick={() => setActivePanel('editor')}
          className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
            activePanel === 'editor'
              ? 'bg-stone-800 dark:bg-zinc-100 text-white dark:text-zinc-900'
              : 'bg-stone-100 dark:bg-white/5 text-stone-500 dark:text-zinc-400'
          }`}
        >
          Редактор
        </button>
        <button
          onClick={() => setActivePanel('preview')}
          className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
            activePanel === 'preview'
              ? 'bg-stone-800 dark:bg-zinc-100 text-white dark:text-zinc-900'
              : 'bg-stone-100 dark:bg-white/5 text-stone-500 dark:text-zinc-400'
          }`}
        >
          Предпросмотр
        </button>
      </div>

      <main className="relative flex flex-1 overflow-hidden">
        {panelsSwapped ? (
          <>
            <div className="h-full bg-white dark:bg-[#131316]" style={{ width: isMobile ? (activePanel === 'preview' ? '100%' : '0%') : `${100 - split}%`, display: isMobile && activePanel !== 'preview' ? 'none' : undefined }}>
              <div className="w-full max-w-[85ch] mx-auto h-full">
                <Preview value={value} fontSize={fontSize} />
              </div>
            </div>

            <div
              onMouseDown={handleMouseDown}
              className="absolute cursor-col-resize z-10 flex items-center justify-center group hidden sm:flex"
              style={{
                left: `calc(${split}% - 22px)`,
                top: 0,
                bottom: 0,
                width: '44px',
              }}
            >
              <div className="w-px h-8 bg-stone-300 dark:bg-white/10 group-hover:h-10 transition-all rounded-full" />
            </div>

            <div className="h-full bg-stone-50 dark:bg-[#0e0e10]" style={{ width: isMobile ? (activePanel === 'editor' ? '100%' : '0%') : `${split}%`, display: isMobile && activePanel !== 'editor' ? 'none' : undefined }}>
              <Editor value={value} onChange={handleChange} fontSize={fontSize - 1} />
            </div>
          </>
        ) : (
          <>
            <div className="h-full bg-stone-50 dark:bg-[#0e0e10]" style={{ width: isMobile ? (activePanel === 'editor' ? '100%' : '0%') : `${split}%`, display: isMobile && activePanel !== 'editor' ? 'none' : undefined }}>
              <Editor value={value} onChange={handleChange} fontSize={fontSize - 1} />
            </div>

            <div
              onMouseDown={handleMouseDown}
              className="absolute cursor-col-resize z-10 flex items-center justify-center group hidden sm:flex"
              style={{
                left: `calc(${split}% - 22px)`,
                top: 0,
                bottom: 0,
                width: '44px',
              }}
            >
              <div className="w-px h-8 bg-stone-300 dark:bg-white/10 group-hover:h-10 transition-all rounded-full" />
            </div>

            <div className="h-full bg-white dark:bg-[#131316]" style={{ width: isMobile ? (activePanel === 'preview' ? '100%' : '0%') : `${100 - split}%`, display: isMobile && activePanel !== 'preview' ? 'none' : undefined }}>
              <div className="w-full max-w-[85ch] mx-auto h-full">
                <Preview value={value} fontSize={fontSize} />
              </div>
            </div>
          </>
        )}
      </main>

      <footer className="px-4 py-1 border-t border-stone-200 dark:border-white/5 bg-white/80 dark:bg-[#0e0e10]/80 backdrop-blur-xl flex items-center justify-between">
        <button
          onClick={() => setPanelsSwapped(!panelsSwapped)}
          className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-stone-500 dark:text-zinc-400 hover:text-stone-700 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-white/5 transition-all duration-200"
          title="Поменять панели местами"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          <span className="hidden sm:inline">Поменять панели</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-stone-500 dark:text-zinc-400 px-2 tabular-nums font-medium">
            {formatWords(wordCount)}
          </span>
          <HelpDialog />
        </div>
      </footer>

      {menuOpen && (
        <div className="fixed inset-0 z-40 sm:hidden">
          <div className="absolute inset-0 bg-black/20 dark:bg-black/40" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white dark:bg-[#1a1a1e] shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 dark:border-white/5">
              <span className="text-sm font-medium text-stone-800 dark:text-zinc-100">Меню</span>
              <button
                onClick={() => setMenuOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-500 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-white/5 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 px-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-stone-500 dark:text-zinc-400 uppercase tracking-wider">Размер шрифта</label>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => setFontSize(Math.max(14, fontSize - 1))}
                    disabled={fontSize <= 14}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-stone-600 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                    </svg>
                  </button>
                  <span className="w-8 text-center text-sm font-medium text-stone-800 dark:text-zinc-100">{fontSize}</span>
                  <button
                    onClick={() => setFontSize(Math.min(18, fontSize + 1))}
                    disabled={fontSize >= 18}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-stone-600 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m-7-7h14" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="border-t border-stone-200 dark:border-white/5 pt-4">
                <label className="text-xs font-medium text-stone-500 dark:text-zinc-400 uppercase tracking-wider">Действия</label>
                <div className="space-y-1 mt-2">
                  <button
                    onClick={() => { download(); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-stone-700 dark:text-zinc-200 hover:bg-stone-100 dark:hover:bg-white/5 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Скачать .md
                  </button>
                  <button
                    onClick={() => { setPanelsSwapped(!panelsSwapped); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-stone-700 dark:text-zinc-200 hover:bg-stone-100 dark:hover:bg-white/5 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                    Поменять панели
                  </button>
                </div>
              </div>

              <div className="border-t border-stone-200 dark:border-white/5 pt-4">
                <label className="text-xs font-medium text-stone-500 dark:text-zinc-400 uppercase tracking-wider">Настройки</label>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-stone-700 dark:text-zinc-200">Тема</span>
                  <ThemeToggle />
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm text-stone-700 dark:text-zinc-200">Шрифт</span>
                  <FontSelector />
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-stone-200 dark:border-white/5">
              <span className="text-xs text-stone-400 dark:text-zinc-500">{formatWords(wordCount)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
