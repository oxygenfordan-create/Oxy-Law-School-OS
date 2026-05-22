import { clsx } from '../../util/clsx';
import { type ReactNode } from 'react';

type BadgeProps = {
  children: ReactNode;
  className?: string;
};

export function Badge({ children, className }: BadgeProps) {
  return <span className={clsx('inline-flex rounded-full bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-stone-200', className)}>{children}</span>;
}
