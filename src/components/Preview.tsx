import md from '../utils/markdownParser';

type PreviewProps = {
  value: string;
  fontSize: number;
};

export const Preview = ({ value, fontSize }: PreviewProps) => {
  if (!value.trim()) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-400 dark:text-zinc-400">
        <div className="text-center">
          <svg className="w-10 h-10 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <p className="text-sm font-light">Начните писать, чтобы увидеть предпросмотр</p>
        </div>
      </div>
    );
  }

  const html = md.render(value);

  return (
    <div
      className="preview prose dark:prose-dark max-w-none px-10 py-6 h-full overflow-y-auto"
      style={{ fontSize: `${fontSize}px` }}
    >
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
};
