import { motion } from 'framer-motion';
import { type ReactNode } from 'react';

type ModalProps = {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
};

export function Modal({ open, title, description, children, onClose }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 16 }}
        className="w-full max-w-2xl rounded-[32px] border border-white/10 bg-ink/95 p-8 shadow-glow backdrop-blur-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">{title}</h2>
            {description && <p className="mt-3 text-sm text-stone-300">{description}</p>}
          </div>
          <button onClick={onClose} className="rounded-2xl bg-white/5 px-3 py-2 text-sm text-stone-200 hover:bg-white/10">
            Close
          </button>
        </div>
        <div className="mt-6">{children}</div>
      </motion.div>
    </div>
  );
}
