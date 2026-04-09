import { renderMarkdown } from '../utils/markdownParser';

type PreviewProps = {
  value: string;
  fontSize: number;
};

export const Preview = ({ value, fontSize }: PreviewProps) => {
  if (!value.trim()) {
    return (
      <div className="flex items-center justify-center min-h-full px-4 sm:px-0 text-zinc-400 dark:text-zinc-400">
        <div className="text-center">
          <p className="text-sm font-light">Start writing in editor to see preview</p>
        </div>
      </div>
    );
  }

  const html = renderMarkdown(value);

  return (
    <div
      className="preview prose dark:prose-dark max-w-none px-4 sm:px-10 py-4 sm:py-6"
      style={{ fontSize: `${fontSize}px` }}
    >
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
};
