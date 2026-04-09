import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useNotes } from './hooks/useNotes';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { FontSelector } from './components/FontSelector';
import { ThemeToggle } from './components/ThemeToggle';
import { HelpDialog } from './components/HelpDialog';
import { fonts, fontKey } from './utils/constants';
import md from './utils/markdownParser';

export const App = () => {
  const {
    notes,
    activeNote,
    activeNoteId,
    createNewNote,
    renameNote,
    updateNoteContent,
    updateNoteImages,
  } = useNotes();

  const [split, setSplit] = useState(50);
  const [panelsSwapped, setPanelsSwapped] = useState(false);
  const [activePanel, setActivePanel] = useState<'editor' | 'preview'>('editor');
  const [fontSize, setFontSize] = useState(() => {
    const saved = parseInt(localStorage.getItem('md-editor-fontsize') || '16', 10);
    return Math.min(Math.max(saved, 14), 18);
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [fontMenuOpen, setFontMenuOpen] = useState(false);
  const [font, setFont] = useState(() => localStorage.getItem(fontKey) || 'inter');
  const [isMobile, setIsMobile] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [minimalMode, setMinimalMode] = useState(false);
  const [showMinimalHint, setShowMinimalHint] = useState(false);
  const isDragging = useRef(false);

  const images = activeNote ? new Map(activeNote.images) : new Map<string, string>();

  const handleImageAdd = useCallback((name: string, dataUrl: string) => {
    if (!activeNoteId || !activeNote) return;
    updateNoteImages(activeNoteId, [...activeNote.images, [name, dataUrl]]);
  }, [activeNoteId, activeNote, updateNoteImages]);

  const handleImageRemove = useCallback((name: string) => {
    if (!activeNoteId || !activeNote) return;
    updateNoteImages(activeNoteId, activeNote.images.filter(([n]) => n !== name));
  }, [activeNoteId, activeNote, updateNoteImages]);

  const download = useCallback(() => {
    if (!activeNote) return;
    const firstLine = activeNote.content.split('\n')[0]?.replace(/^[#\s]+/, '').trim() || 'note';
    const safeName = firstLine.replace(/[<>:"/\\|?*]/g, '').slice(0, 50) || 'note';
    const blob = new Blob([activeNote.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeName}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [activeNote]);

  useEffect(() => {
    localStorage.setItem('md-editor-fontsize', String(fontSize));
  }, [fontSize]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!activeNoteId) return;
    updateNoteContent(activeNoteId, e.target.value);
  };

  const handleMouseDown = useCallback(() => {
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const dividerLeft = `calc(${split}% - 22px)`;

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
      document.body.style.overflow = 'auto';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    if (!minimalMode) return;
    setShowMinimalHint(true);
    const timeout = setTimeout(() => setShowMinimalHint(false), 3000);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMinimalMode(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeout);
    };
  }, [minimalMode]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const savedFont = localStorage.getItem(fontKey) || 'inter';
    setFont(savedFont);
    const font = fonts.find(f => f.id === savedFont);
    if (font) {
      document.body.style.fontFamily = font.family;
    }
  }, []);

  useEffect(() => {
    const fontObj = fonts.find(f => f.id === font);
    if (fontObj) {
      document.body.style.fontFamily = fontObj.family;
      localStorage.setItem(fontKey, font);
    }
  }, [font]);

  const wordCount = activeNote?.content.trim() === '' ? 0 : (activeNote?.content.trim().split(/\s+/).length || 0);

  const formatWords = (count: number) => {
    if (count === 0) return '0 words';
    return `${count} ${count === 1 ? 'word' : 'words'}`;
  };

  const noteCount = notes.length;



  return (
    <div className="flex flex-col h-screen bg-stone-50 dark:bg-[#0e0e10] transition-colors duration-300 overflow-visible">
      <header className={`sticky top-0 z-50 flex items-center justify-between px-4 py-2 border-b border-stone-200 dark:border-white/5 bg-white/80 dark:bg-[#0e0e10]/80 backdrop-blur-xl ${minimalMode ? 'hidden' : ''}`}>
        <div className="flex flex-col shrink-0">
          <h1 className="text-lg font-semibold text-stone-800 dark:text-zinc-100 tracking-tight whitespace-nowrap">MD Persona</h1>
          <span className="hidden lg:block text-xs text-stone-500 dark:text-zinc-400 mt-0.5">Simple Markdown editor for fast writing and clean preview</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={createNewNote}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-stone-600 dark:text-zinc-300 hover:text-stone-900 dark:hover:text-zinc-100 hover:bg-stone-100 dark:hover:bg-white/5 transition-all duration-200"
            title="New Note"
          >
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span className="hidden sm:inline">New Note</span>
          </button>

          <button
            onClick={download}
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

      <div className="sm:hidden flex items-center justify-center gap-2 px-4 py-2 border-b border-stone-200 dark:border-white/5 bg-white/60 dark:bg-[#0e0e10]/60 backdrop-blur-sm">
        <div className="relative flex-1">
          <button
            onClick={() => setActivePanel('editor')}
            className={`w-full py-2 rounded-lg text-xs font-medium transition-all ${
              activePanel === 'editor'
                ? 'bg-stone-800 dark:bg-zinc-100 text-white dark:text-zinc-900'
                : 'bg-stone-100 dark:bg-white/5 text-stone-500 dark:text-zinc-400'
            }`}
          >
            Editor
          </button>
          <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] transition-all duration-200 ${
            activePanel === 'editor' 
              ? 'opacity-100 border-t-stone-800 dark:border-t-zinc-100' 
              : 'opacity-0'
          }`} />
        </div>
        <div className="relative flex-1">
          <button
            onClick={() => setActivePanel('preview')}
            className={`w-full py-2 rounded-lg text-xs font-medium transition-all ${
              activePanel === 'preview'
                ? 'bg-stone-800 dark:bg-zinc-100 text-white dark:text-zinc-900'
                : 'bg-stone-100 dark:bg-white/5 text-stone-500 dark:text-zinc-400'
            }`}
          >
            Preview
          </button>
          <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] transition-all duration-200 ${
            activePanel === 'preview' 
              ? 'opacity-100 border-t-stone-800 dark:border-t-zinc-100' 
              : 'opacity-0'
          }`} />
        </div>
      </div>

      <main className="relative flex flex-1 overflow-hidden">
        {minimalMode ? (
          <div className="h-full w-full bg-white dark:bg-[#131316] overflow-y-auto px-4 sm:px-0">
            <div className="h-full w-full max-w-[900px] mx-auto">
              <Preview value={activeNote?.content || ''} fontSize={fontSize} images={images} />
            </div>
          </div>
        ) : (
          panelsSwapped ? (
          <>
            <div className="h-full bg-white dark:bg-[#131316] overflow-y-auto px-4 sm:px-0" style={{ width: isMobile ? (activePanel === 'preview' ? '100%' : '0%') : `${split}%`, display: isMobile && activePanel !== 'preview' ? 'none' : undefined }}>
              <div className="h-full w-full max-w-[900px] mx-auto">
                <Preview value={activeNote?.content || ''} fontSize={fontSize} images={images} />
              </div>
            </div>

            <div
              onMouseDown={handleMouseDown}
              className="absolute cursor-col-resize z-10 flex items-center justify-center group hidden sm:flex"
              style={{
                left: dividerLeft,
                top: 0,
                bottom: 0,
                width: '44px',
              }}
            >
              <div className="w-px h-8 bg-stone-300 dark:bg-white/10 group-hover:h-10 transition-all rounded-full" />
            </div>

            <div className="h-full bg-stone-50 dark:bg-[#0e0e10] overflow-y-auto px-4 sm:px-0" style={{ width: isMobile ? (activePanel === 'editor' ? '100%' : '0%') : `${100 - split}%`, display: isMobile && activePanel !== 'editor' ? 'none' : undefined }}>
              <Editor value={activeNote?.content || ''} onChange={handleChange} fontSize={fontSize - 1} images={images} onImageAdd={handleImageAdd} onImageRemove={handleImageRemove} />
            </div>
          </>
        ) : (
          <>
            <div className="h-full bg-stone-50 dark:bg-[#0e0e10] overflow-y-auto px-4 sm:px-0" style={{ width: isMobile ? (activePanel === 'editor' ? '100%' : '0%') : `${split}%`, display: isMobile && activePanel !== 'editor' ? 'none' : undefined }}>
              <Editor value={activeNote?.content || ''} onChange={handleChange} fontSize={fontSize - 1} images={images} onImageAdd={handleImageAdd} onImageRemove={handleImageRemove} />
            </div>

            <div
              onMouseDown={handleMouseDown}
              className="absolute cursor-col-resize z-10 flex items-center justify-center group hidden sm:flex"
              style={{
                left: dividerLeft,
                top: 0,
                bottom: 0,
                width: '44px',
              }}
            >
              <div className="w-px h-8 bg-stone-300 dark:bg-white/10 group-hover:h-10 transition-all rounded-full" />
            </div>

            <div className="h-full bg-white dark:bg-[#131316] overflow-y-auto px-4 sm:px-0" style={{ width: isMobile ? (activePanel === 'preview' ? '100%' : '0%') : `${100 - split}%`, display: isMobile && activePanel !== 'preview' ? 'none' : undefined }}>
              <div className="h-full w-full max-w-[900px] mx-auto">
                <Preview value={activeNote?.content || ''} fontSize={fontSize} images={images} />
              </div>
            </div>
          </>
        )
        )}
      </main>

      {minimalMode && showMinimalHint && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2.5 bg-stone-900/90 dark:bg-zinc-100/90 text-white dark:text-zinc-900 text-sm font-medium rounded-full shadow-xl backdrop-blur-sm border border-white/10 dark:border-zinc-200/20">
          Press <span className="opacity-70">Esc</span> to exit
        </div>
      )}

      {!minimalMode && (
        <footer className="hidden sm:flex px-4 py-1 border-t border-stone-200 dark:border-white/5 bg-white/80 dark:bg-[#0e0e10]/80 backdrop-blur-xl items-center justify-between">
          <button
            onClick={() => setPanelsSwapped(!panelsSwapped)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-stone-500 dark:text-zinc-400 hover:text-stone-700 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-white/5 transition-all duration-200"
            title="Swap panels"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span>Swap Panels</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-stone-500 dark:text-zinc-400 px-2 tabular-nums font-medium">
              {formatWords(wordCount)}
            </span>
              <button
              onClick={() => setHelpOpen(true)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-stone-500 dark:text-zinc-400 hover:text-stone-800 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-white/5 transition-all duration-200"
            >
              Markdown tips
            </button>
          </div>
        </footer>
      )}

      <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />

      {menuOpen && (
        <div className="fixed inset-0 z-40 sm:hidden">
          <div className="absolute inset-0 bg-black/20 dark:bg-black/40" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white dark:bg-[#1a1a1e] shadow-2xl flex flex-col pt-20 pb-6 px-4 overflow-y-auto">
            <div className="space-y-1">
              <button
                onClick={() => { createNewNote(); setMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-4 rounded-xl text-sm text-stone-700 dark:text-zinc-200 hover:bg-stone-100 dark:hover:bg-white/5 transition-all h-14"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m-7-7h14" />
                </svg>
                New Note
              </button>

              <button
                onClick={() => { download(); setMenuOpen(false); }}
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
                <div className="flex items-center gap-1">
                  <ThemeToggle />
                </div>
              </div>

              <div className="flex items-center justify-between px-4 py-4 rounded-xl hover:bg-stone-100 dark:hover:bg-white/5 transition-all h-14">
                <span className="text-sm text-stone-700 dark:text-zinc-200">Font Size</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setFontSize(Math.max(14, fontSize - 1))}
                    disabled={fontSize <= 14}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-base text-stone-600 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-medium text-stone-800 dark:text-zinc-100">{fontSize}</span>
                  <button
                    onClick={() => setFontSize(Math.min(18, fontSize + 1))}
                    disabled={fontSize >= 18}
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
                  <span className="text-sm text-stone-600 dark:text-zinc-400">{fonts.find(f => f.id === font)?.label}</span>
                  <svg className={`w-4 h-4 text-stone-400 transition-transform ${fontMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {fontMenuOpen && (
                <div className="px-2 pb-2 space-y-1">
                  {fonts.map(f => (
                    <button
                      key={f.id}
                      onClick={() => setFont(f.id)}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm hover:bg-stone-100 dark:hover:bg-white/5 transition-all"
                    >
                      <span className="w-10 h-10 rounded-lg bg-stone-100 dark:bg-white/5 flex items-center justify-center text-xs font-semibold text-stone-700 dark:text-zinc-300" style={{ fontFamily: f.family }}>Aa</span>
                      <span className="text-stone-700 dark:text-zinc-200" style={{ fontFamily: f.family }}>{f.label}</span>
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={() => { setHelpOpen(true); setMenuOpen(false); }}
                className="w-full px-4 py-4 rounded-xl text-sm text-stone-700 dark:text-zinc-200 hover:bg-stone-100 dark:hover:bg-white/5 transition-all text-left h-14"
              >
                Markdown Tips
              </button>

              <div className="mt-4 pt-4 border-t border-stone-200 dark:border-white/10">
                <p className="text-sm text-stone-500 dark:text-zinc-400 text-center">Simple Markdown editor for fast writing and clean preview</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
