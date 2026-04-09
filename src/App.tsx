import { useState, useCallback, useRef, useEffect } from 'react';
import { useNotes } from './hooks/useNotes';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { HelpDialog } from './components/HelpDialog';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { MobileMenu } from './components/MobileMenu';
import { fonts, fontKey } from './utils/constants';

export const App = () => {
  const {
    notes,
    activeNote,
    activeNoteId,
    createNewNote,
    updateNoteContent,
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
  const [minimalHintVisible, setMinimalHintVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedVisible, setCopiedVisible] = useState(false);
  const isDragging = useRef(false);

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
    setMinimalHintVisible(true);
    const fadeOutTimeout = setTimeout(() => setMinimalHintVisible(false), 4000);
    const removeTimeout = setTimeout(() => setShowMinimalHint(false), 4500);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMinimalHintVisible(false);
        setTimeout(() => setShowMinimalHint(false), 300);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(fadeOutTimeout);
      clearTimeout(removeTimeout);
    };
  }, [minimalMode]);

  useEffect(() => {
    if (!copied) return;
    setCopiedVisible(true);
    const fadeOutTimeout = setTimeout(() => setCopiedVisible(false), 1500);
    const removeTimeout = setTimeout(() => setCopied(false), 2000);
    return () => {
      clearTimeout(fadeOutTimeout);
      clearTimeout(removeTimeout);
    };
  }, [copied]);

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

  return (
    <div className="flex flex-col h-screen bg-stone-50 dark:bg-dark-primary transition-colors duration-300 overflow-visible">
      <Header
        fontSize={fontSize}
        setFontSize={setFontSize}
        font={font}
        setFont={setFont}
        minimalMode={minimalMode}
        setMinimalMode={setMinimalMode}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        onNewNote={createNewNote}
        onDownload={download}
      />

      <div className="sm:hidden flex items-center justify-center gap-2 px-4 py-2 border-b border-stone-200 dark:border-white/5 bg-white/60 dark:bg-dark-primary/60 backdrop-blur-sm">
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
          <div className="h-full w-full bg-white dark:bg-dark-secondary overflow-y-auto px-4 sm:px-0">
            <div className="h-full w-full max-w-[900px] mx-auto">
              <Preview value={activeNote?.content || ''} fontSize={fontSize} />
            </div>
          </div>
        ) : (
          panelsSwapped ? (
          <>
            <div className="h-full bg-white dark:bg-dark-secondary overflow-y-auto px-4 sm:px-0" style={{ width: isMobile ? (activePanel === 'preview' ? '100%' : '0%') : `${split}%`, display: isMobile && activePanel !== 'preview' ? 'none' : undefined }}>
              <div className="h-full w-full max-w-[900px] mx-auto">
                <Preview value={activeNote?.content || ''} fontSize={fontSize} />
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

            <div className="h-full bg-stone-50 dark:bg-dark-primary overflow-y-auto px-4 sm:px-0" style={{ width: isMobile ? (activePanel === 'editor' ? '100%' : '0%') : `${100 - split}%`, display: isMobile && activePanel !== 'editor' ? 'none' : undefined }}>
              <Editor value={activeNote?.content || ''} onChange={handleChange} fontSize={fontSize - 1} onCopied={() => setCopied(true)} />
            </div>
          </>
        ) : (
          <>
            <div className="h-full bg-stone-50 dark:bg-dark-primary overflow-y-auto px-4 sm:px-0" style={{ width: isMobile ? (activePanel === 'editor' ? '100%' : '0%') : `${split}%`, display: isMobile && activePanel !== 'editor' ? 'none' : undefined }}>
              <Editor value={activeNote?.content || ''} onChange={handleChange} fontSize={fontSize - 1} onCopied={() => setCopied(true)} />
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

            <div className="h-full bg-white dark:bg-dark-secondary overflow-y-auto px-4 sm:px-0" style={{ width: isMobile ? (activePanel === 'preview' ? '100%' : '0%') : `${100 - split}%`, display: isMobile && activePanel !== 'preview' ? 'none' : undefined }}>
              <div className="h-full w-full max-w-[900px] mx-auto">
                <Preview value={activeNote?.content || ''} fontSize={fontSize} />
              </div>
            </div>
          </>
        )
        )}
      </main>

      {minimalMode && showMinimalHint && (
        <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 px-4 py-2.5 bg-stone-900/90 dark:bg-zinc-100/90 text-white dark:text-zinc-900 text-sm font-medium rounded-full shadow-xl backdrop-blur-sm border border-white/10 dark:border-zinc-200/20 transition-all duration-300 ${minimalHintVisible ? 'opacity-100' : 'opacity-0'}`}>
          Press <span className="opacity-70">Esc</span> to exit
        </div>
      )}

      {copied && (
        <div className={`fixed bottom-16 left-1/2 transform -translate-x-1/2 px-4 py-2.5 bg-stone-900/90 dark:bg-zinc-100/90 text-white dark:text-zinc-900 text-sm font-medium rounded-full shadow-xl backdrop-blur-sm border border-white/10 dark:border-zinc-200/20 transition-all duration-300 ${copiedVisible ? 'opacity-100' : 'opacity-0'}`}>
          Copied to clipboard
        </div>
      )}

      <Footer
        wordCount={wordCount}
        onSwapPanels={() => setPanelsSwapped(!panelsSwapped)}
        onHelpOpen={() => setHelpOpen(true)}
        minimalMode={minimalMode}
      />

      <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        fontSize={fontSize}
        setFontSize={setFontSize}
        font={font}
        setFont={setFont}
        fontMenuOpen={fontMenuOpen}
        setFontMenuOpen={setFontMenuOpen}
        onNewNote={createNewNote}
        onDownload={download}
        onHelpOpen={() => setHelpOpen(true)}
      />
    </div>
  );
};