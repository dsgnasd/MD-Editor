import { memo } from 'react';
import { Editor } from './Editor';
import { Preview } from './Preview';
import { Divider } from './Divider';
import { TableOfContents } from './TableOfContents';

type SplitViewProps = {
  swapped: boolean;
  split: number;
  dividerLeft: string;
  onDividerMouseDown: () => void;
  isMobile: boolean;
  activePanel: 'editor' | 'preview';
  content: string;
  onChange: (val: string) => void;
  onCopied: () => void;
  tocVisible: boolean;
  tocWidth: number;
  onTocResizeStart: () => void;
  onHeadingClick: (id: string) => void;
  activeHeadingId: string | null;
};

export const SplitView = memo(
  ({
    swapped,
    split,
    dividerLeft,
    onDividerMouseDown,
    isMobile,
    activePanel,
    content,
    onChange,
    onCopied,
    tocVisible,
    tocWidth,
    onTocResizeStart,
    onHeadingClick,
    activeHeadingId,
  }: SplitViewProps) => {
    const showToc = tocVisible && !isMobile;
    const tocWidthStr = showToc ? `${tocWidth}%` : '0%';

    const leftWidth = `${split}%`;
    const rightWidth = `${100 - split}%`;

    const editorWidth = isMobile
      ? activePanel === 'editor' ? '100%' : '0%'
      : swapped ? rightWidth : leftWidth;
    const previewWidth = isMobile
      ? activePanel === 'preview' ? '100%' : '0%'
      : swapped ? leftWidth : rightWidth;

    const editorHidden = isMobile && activePanel !== 'editor' ? 'none' : undefined;
    const previewHidden = isMobile && activePanel !== 'preview' ? 'none' : undefined;

    const editorPane = (
      <div
        className="h-full bg-stone-50 dark:bg-dark-primary overflow-y-auto"
        style={{ width: editorWidth, display: editorHidden }}
      >
        <Editor value={content} onChange={onChange} onCopied={onCopied} />
      </div>
    );

    const previewPane = (
      <div
        className="preview-scroll-container h-full bg-white dark:bg-dark-secondary overflow-y-auto"
        style={{ width: previewWidth, display: previewHidden }}
      >
        <div className="h-full w-full max-w-[900px] mx-auto">
          <Preview value={content} />
        </div>
      </div>
    );

    const divider = (
      <Divider left={dividerLeft} onMouseDown={onDividerMouseDown} />
    );

    return (
      <>
        {showToc && (
          <div style={{ width: tocWidthStr }} className="shrink-0 h-full">
            <TableOfContents
              content={content}
              onHeadingClick={onHeadingClick}
              activeId={activeHeadingId}
              onResizeStart={onTocResizeStart}
            />
          </div>
        )}
        <div className="split-panels-container relative flex flex-1 h-full min-w-0">
          {swapped ? (
            <>{previewPane}{divider}{editorPane}</>
          ) : (
            <>{editorPane}{divider}{previewPane}</>
          )}
        </div>
      </>
    );
  },
);
SplitView.displayName = 'SplitView';
