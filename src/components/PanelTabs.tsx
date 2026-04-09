import { memo } from 'react';

type PanelTabsProps = {
  active: 'editor' | 'preview';
  onChange: (panel: 'editor' | 'preview') => void;
};

const PANELS = [
  { id: 'editor' as const, label: 'Editor' },
  { id: 'preview' as const, label: 'Preview' },
];

export const PanelTabs = memo(({ active, onChange }: PanelTabsProps) => (
  <div className="sm:hidden flex items-center justify-center gap-2 px-4 py-2 border-b border-stone-200 dark:border-white/5 bg-white/60 dark:bg-dark-primary/60 backdrop-blur-sm">
    {PANELS.map(({ id, label }) => (
      <div key={id} className="relative flex-1">
        <button
          onClick={() => onChange(id)}
          className={`w-full py-2 rounded-lg text-xs font-medium transition-all ${
            active === id
              ? 'bg-stone-800 dark:bg-zinc-100 text-white dark:text-zinc-900'
              : 'bg-stone-100 dark:bg-white/5 text-stone-500 dark:text-zinc-400'
          }`}
        >
          {label}
        </button>
        <div
          className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] transition-all duration-200 ${
            active === id
              ? 'opacity-100 border-t-stone-800 dark:border-t-zinc-100'
              : 'opacity-0'
          }`}
        />
      </div>
    ))}
  </div>
));
PanelTabs.displayName = 'PanelTabs';
