import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';

type OnboardingModalProps = {
  onDismiss: () => void;
};

export function OnboardingModal({ onDismiss }: OnboardingModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl rounded-[32px] border border-white/10 bg-ink/95 p-8 shadow-glow"
      >
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.32em] text-amberSoft">Welcome to Law School OS</p>
          <h2 className="text-3xl font-semibold text-white">Start your legal productivity system.</h2>
          <p className="text-sm leading-7 text-stone-300">
            This workspace is offline-first, with autosave, module shortcuts, and a premium study flow built for case law, statutory annotation, flashcards, and courtroom practice.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="border border-white/10 bg-black/20 p-5">
              <p className="text-sm uppercase tracking-[0.3em] text-stone-500">Command Palette</p>
              <p className="mt-3 text-sm text-stone-300">Press Cmd/Ctrl + K to jump between modules instantly.</p>
            </Card>
            <Card className="border border-white/10 bg-black/20 p-5">
              <p className="text-sm uppercase tracking-[0.3em] text-stone-500">Live Backup</p>
              <p className="mt-3 text-sm text-stone-300">Export your full workspace to JSON and restore or move to another device.</p>
            </Card>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={onDismiss}>Begin the OS</Button>
            <Button variant="ghost" onClick={onDismiss}>Skip tour</Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
