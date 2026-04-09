import { memo } from 'react';
import { Preview } from './Preview';

type MinimalViewProps = {
  content: string;
  fontSize: number;
};

export const MinimalView = memo(({ content, fontSize }: MinimalViewProps) => (
  <div className="absolute inset-0 w-full bg-white dark:bg-dark-secondary overflow-y-auto px-4 sm:px-0 pt-14">
    <div className="w-full max-w-[900px] mx-auto">
      <Preview value={content} fontSize={fontSize} />
    </div>
  </div>
));
MinimalView.displayName = 'MinimalView';
