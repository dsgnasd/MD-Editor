import { memo, useMemo } from 'react';
import { renderMarkdown } from '../utils/markdownParser';

type PreviewProps = {
  value: string;
};

export const Preview = memo(({ value }: PreviewProps) => {
  const html = useMemo(() => renderMarkdown(value), [value]);

  if (!value.trim()) {
    return (
      <div className="flex items-center justify-center min-h-full px-4 sm:px-0 text-zinc-400 dark:text-zinc-400">
        <div className="text-center">
          <p className="text-sm font-light">Start writing in editor to see preview</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="preview prose dark:prose-dark max-w-none px-4 sm:px-10 py-4 sm:py-6"
    >
      {/* HTML is sanitized by renderMarkdown() via DOMPurify — safe to render */}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
});
Preview.displayName = 'Preview';
