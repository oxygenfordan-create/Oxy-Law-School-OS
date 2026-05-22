import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { ArrowRight, Search } from 'lucide-react';

const commands = [
  { key: '1', label: 'Go to Workspace' },
  { key: '2', label: 'Open Case Digests' },
  { key: '3', label: 'Open Codal Companion' },
  { key: '4', label: 'Open Flashcards' },
  { key: '5', label: 'Open Objection Simulator' }
];

export function CommandPalette() {
  const setActiveView = useStore((state) => state.setActiveView);
  const toggleCommand = useStore((state) => state.toggleCommand);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-2xl rounded-[32px] border border-white/10 bg-ink/95 p-6 shadow-glow"
      >
        <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-stone-200">
          <Search className="h-5 w-5" />
          <span>Type a command or select a view</span>
        </div>
        <div className="mt-4 space-y-3">
          {commands.map((command) => (
            <button
              key={command.key}
              onClick={() => {
                setActiveView(command.key === '1' ? 'overview' : command.key === '2' ? 'digests' : command.key === '3' ? 'codal' : command.key === '4' ? 'flashcards' : 'objections');
                toggleCommand();
              }}
              className="flex w-full items-center justify-between rounded-3xl border border-white/10 bg-black/20 px-4 py-4 text-left text-white transition hover:border-amberSoft/30 hover:bg-amberSoft/10"
            >
              <div>
                <p className="text-sm font-semibold">{command.label}</p>
                <p className="text-xs text-stone-400">Shortcut: {command.key}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-stone-300" />
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
