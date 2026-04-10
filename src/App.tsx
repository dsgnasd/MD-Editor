import { useState, useCallback, useMemo } from 'react';
import { useNotes } from './hooks/useNotes';
import { useSplitPane } from './hooks/useSplitPane';
import { useTocPane } from './hooks/useTocPane';
import { useIsMobile } from './hooks/useIsMobile';
import { useAutoHideToast } from './hooks/useAutoHideToast';
import { useEscapeKey } from './hooks/useEscapeKey';
import { useBodyScrollLock } from './hooks/useBodyScrollLock';
import { usePreferencesContext } from './context/PreferencesContext';
import { useToast } from './context/ToastContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { MobileMenu } from './components/MobileMenu';
import { HelpDialog } from './components/HelpDialog';
import { PanelTabs } from './components/PanelTabs';
import { SplitView } from './components/SplitView';
import { MinimalView } from './components/MinimalView';
import { Toast } from './components/Toast';
import { MAX_FILENAME_LENGTH, MINIMAL_HINT } from './utils/config';

export const App = () => {
  const { activeNote, activeNoteId, createNewNote, updateNoteContent } = useNotes();
  const {
    split,
    panelsSwapped,
    toggleSwap,
    activePanel,
    setActivePanel,
    onDividerMouseDown,
    dividerLeft,
  } = useSplitPane();
  const { tocWidth, onTocResizeStart } = useTocPane();
  const { minimalMode, setMinimalMode, tocVisible } = usePreferencesContext();
  const isMobile = useIsMobile();
  const { showToast, toastVisible, toastFading, toastMessage } = useToast();
  const [helpOpen, setHelpOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);
  const [minimalEditing, setMinimalEditing] = useState(false);

  const { rendered: hintRendered, visible: hintVisible } = useAutoHideToast(
    minimalMode,
    MINIMAL_HINT.fadeMs,
    MINIMAL_HINT.removeMs,
  );

  const exitMinimalMode = useCallback(() => {
    setMinimalMode(false);
    setMinimalEditing(false);
  }, [setMinimalMode]);
  useEscapeKey(exitMinimalMode, minimalMode);
  useBodyScrollLock(menuOpen);

  const content = activeNote?.content ?? '';

  const wordCount = useMemo(() => {
    const trimmed = content.trim();
    return trimmed === '' ? 0 : trimmed.split(/\s+/).length;
  }, [content]);

  const handleChange = useCallback(
    (val: string) => {
      if (!activeNoteId) return;
      updateNoteContent(activeNoteId, val);
    },
    [activeNoteId, updateNoteContent],
  );

  const handleHeadingClick = useCallback(
    (id: string) => {
      setActiveHeadingId(id);

      // Scroll Preview to heading
      const previewEl = document.querySelector('.preview-scroll-container');
      if (previewEl) {
        const heading = previewEl.querySelector(`[id="${CSS.escape(id)}"]`);
        if (heading) {
          heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }

      // Scroll Editor to the corresponding line
      const textarea = document.querySelector('textarea');
      if (textarea && content) {
        const lines = content.split('\n');
        let targetLine = -1;
        for (let i = 0; i < lines.length; i++) {
          const match = lines[i].match(/^(#{1,6})\s+(.+)$/);
          if (match) {
            const headingId = match[2]
              .trim()
              .toLowerCase()
              .replace(/[^\wа-яё]+/g, '-')
              .replace(/-+$/, '');
            if (headingId === id) {
              targetLine = i;
              break;
            }
          }
        }
        if (targetLine >= 0) {
          const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight) || 24;
          textarea.scrollTop = targetLine * lineHeight;
        }
      }
    },
    [content],
  );

  const download = useCallback(() => {
    if (!activeNote) return;
    const firstLine =
      activeNote.content
        .split('\n')[0]
        ?.replace(/^[#\s]+/, '')
        .trim() || 'note';
    const safeName = firstLine.replace(/[<>:"/\\|?*]/g, '').slice(0, MAX_FILENAME_LENGTH) || 'note';
    const blob = new Blob([activeNote.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeName}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [activeNote]);

  return (
    <div className="flex flex-col h-screen sm:h-screen bg-stone-50 dark:bg-dark-primary transition-colors duration-300 overflow-visible max-sm:min-h-screen max-sm:h-auto">
      <Header
        onNewNote={createNewNote}
        onDownload={download}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        minimalEditing={minimalEditing}
        onToggleMinimalEditing={() => setMinimalEditing((v) => !v)}
      />

      {isMobile && <PanelTabs active={activePanel} onChange={setActivePanel} />}

      <main className="relative flex flex-1 overflow-hidden max-sm:overflow-visible">
        {minimalMode ? (
          <MinimalView
            content={content}
            editing={minimalEditing}
            onChange={handleChange}
            onCopied={() => showToast('Copied to clipboard')}
          />
        ) : (
          <SplitView
            swapped={panelsSwapped}
            split={split}
            dividerLeft={dividerLeft}
            onDividerMouseDown={onDividerMouseDown}
            isMobile={isMobile}
            activePanel={activePanel}
            content={content}
            onChange={handleChange}
            onCopied={() => showToast('Copied to clipboard')}
            tocVisible={tocVisible}
            tocWidth={tocWidth}
            onTocResizeStart={onTocResizeStart}
            onHeadingClick={handleHeadingClick}
            activeHeadingId={activeHeadingId}
          />
        )}
      </main>

      {minimalMode && hintRendered && (
        <div
          className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 px-4 py-2.5 bg-stone-900/90 dark:bg-zinc-100/90 text-white dark:text-zinc-900 text-sm font-medium rounded-full shadow-xl backdrop-blur-sm border border-white/10 dark:border-zinc-200/20 transition-all duration-300 ${
            hintVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          Press <span className="opacity-70">Esc</span> to exit
        </div>
      )}

      <Toast visible={toastVisible} fading={toastFading} message={toastMessage} />

      {!minimalMode && (
        <Footer
          wordCount={wordCount}
          onSwapPanels={toggleSwap}
          onHelpOpen={() => setHelpOpen(true)}
        />
      )}

      <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNewNote={createNewNote}
        onDownload={download}
        onHelpOpen={() => setHelpOpen(true)}
      />
    </div>
  );
};
