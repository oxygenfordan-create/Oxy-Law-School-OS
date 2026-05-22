import { clsx } from '../../util/clsx';
import { type TextareaHTMLAttributes } from 'react';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={clsx(
        'min-h-[120px] w-full rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-stone-500 outline-none transition focus:border-amberSoft/60 focus:ring-2 focus:ring-amberSoft/20',
        className
      )}
      {...props}
    />
  );
}
