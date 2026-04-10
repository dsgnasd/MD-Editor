import { memo } from 'react';
import { Preview } from './Preview';
import { Editor } from './Editor';

type MinimalViewProps = {
  content: string;
  editing: boolean;
  onChange: (val: string) => void;
  onCopied: () => void;
};

export const MinimalView = memo(({ content, editing, onChange, onCopied }: MinimalViewProps) => (
  <div className="absolute inset-0 w-full bg-white dark:bg-dark-secondary overflow-y-auto px-4 sm:px-0 pt-14">
    {editing ? (
      <div className="w-full h-full">
        <Editor value={content} onChange={onChange} onCopied={onCopied} />
      </div>
    ) : (
      <div className="w-full max-w-[900px] mx-auto">
        <Preview value={content} />
      </div>
    )}
  </div>
));
MinimalView.displayName = 'MinimalView';
