import { renderMarkdown } from '../utils/markdownParser';

type ImageMap = Map<string, string>;

type PreviewProps = {
  value: string;
  fontSize: number;
  images: ImageMap;
};

export const Preview = ({ value, fontSize, images }: PreviewProps) => {
  if (!value.trim()) {
    return (
      <div className="flex items-center justify-center min-h-full px-4 sm:px-0 text-zinc-400 dark:text-zinc-400">
        <div className="text-center">
          <p className="text-sm font-light">Start writing in editor to see preview</p>
        </div>
      </div>
    );
  }

  const expandedValue = value.replace(
    /!\[([^\]]+)\](?!\()/g,
    (match, name) => {
      const dataUrl = images.get(name);
      if (dataUrl) {
        return `![${name}](${dataUrl})`;
      }
      return match;
    }
  );

  const html = renderMarkdown(expandedValue);

  return (
    <div
      className="preview prose dark:prose-dark max-w-none px-4 sm:px-10 py-4 sm:py-6"
      style={{ fontSize: `${fontSize}px` }}
    >
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
};
