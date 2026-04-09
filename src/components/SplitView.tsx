import { memo } from 'react';
import { Editor } from './Editor';
import { Preview } from './Preview';
import { Divider } from './Divider';

type SplitViewProps = {
  swapped: boolean;
  split: number;
  dividerLeft: string;
  onDividerMouseDown: () => void;
  isMobile: boolean;
  activePanel: 'editor' | 'preview';
  content: string;
  fontSize: number;
  onChange: (val: string) => void;
  onCopied: () => void;
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
    fontSize,
    onChange,
    onCopied,
  }: SplitViewProps) => {
    const leftWidth = `${split}%`;
    const rightWidth = `${100 - split}%`;

    // When swapped: Preview is on the left (leftWidth), Editor on the right (rightWidth)
    // When not swapped: Editor is on the left (leftWidth), Preview on the right (rightWidth)
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
        className="h-full bg-stone-50 dark:bg-dark-primary overflow-y-auto px-4 sm:px-0"
        style={{ width: editorWidth, display: editorHidden }}
      >
        <Editor value={content} onChange={onChange} fontSize={fontSize - 1} onCopied={onCopied} />
      </div>
    );

    const previewPane = (
      <div
        className="h-full bg-white dark:bg-dark-secondary overflow-y-auto px-4 sm:px-0"
        style={{ width: previewWidth, display: previewHidden }}
      >
        <div className="h-full w-full max-w-[900px] mx-auto">
          <Preview value={content} fontSize={fontSize} />
        </div>
      </div>
    );

    const divider = (
      <Divider left={dividerLeft} onMouseDown={onDividerMouseDown} />
    );

    return swapped ? (
      <>{previewPane}{divider}{editorPane}</>
    ) : (
      <>{editorPane}{divider}{previewPane}</>
    );
  },
);
SplitView.displayName = 'SplitView';
