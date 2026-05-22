import { clsx } from '../../util/clsx';
import { type InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={clsx(
        'w-full rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-stone-500 outline-none transition focus:border-amberSoft/60 focus:ring-2 focus:ring-amberSoft/20',
        className
      )}
      {...props}
    />
  );
}
