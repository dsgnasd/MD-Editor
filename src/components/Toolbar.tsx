type ToolbarProps = {
  onInsert: (text: string) => void;
};

const Btn = ({ children, onClick, title }: { children: React.ReactNode; onClick: () => void; title: string }) => (
  <button
    onClick={onClick}
    title={title}
    className="px-2.5 py-1.5 rounded-md text-stone-500 dark:text-zinc-400 hover:text-stone-800 dark:hover:text-zinc-100 hover:bg-stone-100 dark:hover:bg-white/5 transition text-sm"
  >
    {children}
  </button>
);

export const Toolbar = ({ onInsert }: ToolbarProps) => {
  const wrap = (start: string, end: string = start) => {
    onInsert(start + end);
  };

  return (
    <div className="flex items-center gap-0.5">
      <Btn onClick={() => wrap('**', '**')} title="Жирный"><span className="font-bold">B</span></Btn>
      <Btn onClick={() => wrap('*', '*')} title="Курсив"><span className="italic">I</span></Btn>
      <Btn onClick={() => wrap('`', '`')} title="Код"><span className="font-mono text-xs">{'<>'}</span></Btn>
      <Btn onClick={() => { const url = prompt('URL'); if (url) onInsert(`[текст](${url})`); }} title="Ссылка">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" /><path strokeLinecap="round" strokeLinejoin="round" d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101" /></svg>
      </Btn>
      <div className="w-px h-4 bg-stone-200 dark:bg-white/10 mx-1" />
      <Btn onClick={() => wrap('# ', '\n')} title="H1"><span className="font-bold text-xs">H1</span></Btn>
      <Btn onClick={() => wrap('## ', '\n')} title="H2"><span className="font-bold text-xs">H2</span></Btn>
      <Btn onClick={() => wrap('### ', '\n')} title="H3"><span className="font-bold text-xs">H3</span></Btn>
      <div className="w-px h-4 bg-stone-200 dark:bg-white/10 mx-1" />
      <Btn onClick={() => onInsert('- ')} title="Список">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>
      </Btn>
      <Btn onClick={() => { const url = prompt('URL изображения'); if (url) onInsert(`![alt](${url})`); }} title="Изображение">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
      </Btn>
      <Btn onClick={() => onInsert('> ')} title="Цитата">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" /></svg>
      </Btn>
      <Btn onClick={() => onInsert('\n---\n')} title="Линия">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M4 12h16" /></svg>
      </Btn>
    </div>
  );
};
