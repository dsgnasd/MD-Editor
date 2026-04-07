import { useEffect, useState, useRef } from 'react';
import { fontKey, fonts } from '../utils/constants';

const Dropdown = ({
  value,
  options,
  onSelect,
  renderOption,
  renderTrigger,
}: {
  value: string;
  options: string[];
  onSelect: (id: string) => void;
  renderOption: (id: string, active: boolean) => React.ReactNode;
  renderTrigger: () => React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="group flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-stone-600 dark:text-zinc-300 hover:text-stone-900 dark:hover:text-zinc-100 hover:bg-stone-100 dark:hover:bg-white/5 transition-all duration-200"
      >
        {renderTrigger()}
        <svg className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-white/10 rounded-xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] z-30 overflow-hidden">
            <div className="p-1">
              {options.map(id => (
                <button
                  key={id}
                  onClick={() => { onSelect(id); setOpen(false); }}
                  className="w-full text-left rounded-xl hover:bg-stone-50 dark:hover:bg-white/5 transition"
                >
                  {renderOption(id, value === id)}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const FontPreview = ({ id, active }: { id: string; active: boolean }) => {
  const f = fonts.find(font => font.id === id)!;

  return (
    <div className="px-3 py-2.5 flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center bg-stone-50 dark:bg-white/5"
        style={{ fontFamily: f.family }}
      >
        <span className="text-sm font-semibold text-stone-700 dark:text-zinc-300">Aa</span>
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-stone-700 dark:text-zinc-300" style={{ fontFamily: f.family }}>{f.label}</span>
      </div>
      {active && (
        <div className="w-1.5 h-1.5 rounded-full bg-stone-800 dark:bg-zinc-300 flex-shrink-0" />
      )}
    </div>
  );
};

export const FontSelector = () => {
  const [font, setFont] = useState(() => localStorage.getItem(fontKey) || 'inter');

  useEffect(() => {
    const selected = fonts.find(f => f.id === font);
    if (selected) {
      document.body.style.fontFamily = selected.family;
      localStorage.setItem(fontKey, font);
    }
  }, [font]);

  const current = fonts.find(f => f.id === font);

  return (
    <Dropdown
      value={font}
      options={fonts.map(f => f.id)}
      onSelect={setFont}
      renderTrigger={() => (
        <>
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h8m-8 6h16" />
          </svg>
          <span className="text-sm" style={{ fontFamily: current?.family }}>{current?.label}</span>
        </>
      )}
      renderOption={(id, active) => <FontPreview id={id} active={active} />}
    />
  );
};
