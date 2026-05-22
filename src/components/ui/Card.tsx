import { clsx } from '../../util/clsx';
import { type ReactNode } from 'react';

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className }: CardProps) {
  return <div className={clsx('rounded-[32px] border border-white/10 bg-black/30 shadow-soft', className)}>{children}</div>;
}
