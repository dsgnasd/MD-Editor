import md from '../utils/markdownParser';

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
          <svg className="w-10 h-10 mx-auto mb-3 opacity-40 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <p className="text-sm font-light animate-pulse">Start writing to see preview</p>
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

  const html = md.render(expandedValue);

  return (
    <div
      className="preview prose dark:prose-dark max-w-none px-4 sm:px-10 py-4 sm:py-6"
      style={{ fontSize: `${fontSize}px` }}
    >
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
};
