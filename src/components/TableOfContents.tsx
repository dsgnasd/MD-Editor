import { memo, useMemo } from 'react';

type TOCItem = {
  id: string;
  text: string;
  level: number;
};

type TableOfContentsProps = {
  content: string;
  onHeadingClick: (id: string) => void;
  activeId: string | null;
  onResizeStart: () => void;
};

export const TableOfContents = memo(
  ({ content, onHeadingClick, activeId, onResizeStart }: TableOfContentsProps) => {
    const items = useMemo(() => {
      const lines = content.split('\n');
      const headings: TOCItem[] = [];

      lines.forEach((line) => {
        const match = line.match(/^(#{1,6})\s+(.+)$/);
        if (match) {
          const level = match[1].length;
          const text = match[2].trim();
          const id = text
            .toLowerCase()
            .replace(/[^\wа-яё]+/g, '-')
            .replace(/-+$/, '');
          headings.push({ id, text, level });
        }
      });

      return headings;
    }, [content]);

    return (
      <div className="relative h-full bg-stone-100 dark:bg-dark-primary border-r border-stone-200 dark:border-zinc-800 overflow-y-auto shrink-0">
        {items.length === 0 ? (
          <div className="flex items-center justify-center min-h-full px-4">
            <p className="text-sm font-light text-stone-400 dark:text-zinc-400">
              No headings yet
            </p>
          </div>
        ) : (
          <nav className="space-y-0.5 px-3 py-4 sm:py-6">
            {items.map((item, i) => (
              <button
                data-id={item.id}
                key={`${item.id}-${i}`}
                onClick={() => onHeadingClick(item.id)}
                className={`block w-full text-left text-sm py-1.5 px-2 rounded transition-colors duration-200 truncate ${
                  activeId === item.id
                    ? 'bg-stone-200 dark:bg-zinc-700 text-stone-800 dark:text-zinc-200'
                    : 'text-stone-500 dark:text-zinc-400 hover:text-stone-700 dark:hover:text-zinc-300 hover:bg-stone-200/50 dark:hover:bg-white/5'
                }`}
                style={{ paddingLeft: `${(item.level - 1) * 12 + 8}px` }}
                title={item.text}
              >
                {item.text}
              </button>
            ))}
          </nav>
        )}
        {/* Invisible resize handle on the right edge */}
        <div
          className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-stone-300/40 dark:hover:bg-zinc-600/30 transition-colors"
          onMouseDown={(e) => {
            e.preventDefault();
            onResizeStart();
          }}
        />
      </div>
    );
  },
);
TableOfContents.displayName = 'TableOfContents';
