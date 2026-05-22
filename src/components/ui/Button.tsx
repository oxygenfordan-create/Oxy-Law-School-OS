import { clsx } from '../../util/clsx';
import { type ButtonHTMLAttributes, type ReactNode } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  children: ReactNode;
};

export function Button({ variant = 'primary', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-amberSoft/30',
        variant === 'primary' && 'bg-amberSoft text-ink shadow-[0_24px_50px_rgba(217,180,156,0.24)] hover:bg-amberSoft/90',
        variant === 'secondary' && 'bg-white/5 text-white hover:bg-white/10',
        variant === 'ghost' && 'bg-transparent text-stone-200 hover:bg-white/5',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
