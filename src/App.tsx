import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { BookOpen, LightningBolt, Moon, Sun, Triangle, Zap } from 'lucide-react';
import { useStore } from './store/useStore';
import { CaseDigests } from './modules/CaseDigests';
import { CodalCompanion } from './modules/CodalCompanion';
import { Flashcards } from './modules/Flashcards';
import { ObjectionSimulator } from './modules/ObjectionSimulator';
import { CommandPalette } from './modules/CommandPalette';
import { OnboardingModal } from './modules/OnboardingModal';
import { Button } from './components/ui/Button';
import { Card } from './components/ui/Card';
import { Input } from './components/ui/Input';
import { Badge } from './components/ui/Badge';

const navigation = [
  { id: 'overview', label: 'Workspace', icon: BookOpen },
  { id: 'digests', label: 'Case Digests', icon: Triangle },
  { id: 'codal', label: 'Codal Companion', icon: LightningBolt },
  { id: 'flashcards', label: 'Flashcards', icon: Zap },
  { id: 'objections', label: 'Objection Simulator', icon: BookOpen }
] as const;

export default function App() {
  const theme = useStore((state) => state.theme);
  const activeView = useStore((state) => state.activeView);
  const quote = useStore((state) => state.quote);
  const ambientMode = useStore((state) => state.ambientMode);
  const isCommandOpen = useStore((state) => state.isCommandOpen);
  const onboardingSeen = useStore((state) => state.onboardingSeen);
  const setTheme = useStore((state) => state.setTheme);
  const setActiveView = useStore((state) => state.setActiveView);
  const toggleAmbient = useStore((state) => state.toggleAmbient);
  const toggleCommand = useStore((state) => state.toggleCommand);
  const setOnboardingSeen = useStore((state) => state.setOnboardingSeen);
  const digests = useStore((state) => state.digests);
  const articles = useStore((state) => state.articles);
  const cards = useStore((state) => state.cards);

  const [landingVisible, setLandingVisible] = useState(true);
  const [heroSearch, setHeroSearch] = useState('');

  useEffect(() => {
    document.body.classList.toggle('light', theme === 'light');
  }, [theme]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        toggleCommand();
      }
      if (event.key === 'Escape' && isCommandOpen) {
        toggleCommand();
      }
      if (event.key === '1') setActiveView('overview');
      if (event.key === '2') setActiveView('digests');
      if (event.key === '3') setActiveView('codal');
      if (event.key === '4') setActiveView('flashcards');
      if (event.key === '5') setActiveView('objections');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggleCommand, setActiveView, isCommandOpen]);

  const digestCount = digests.length;
  const articleCount = articles.length;
  const cardCount = cards.length;

  const deckSummary = useMemo(() => ({ digests: digestCount, provisions: articleCount, flashcards: cardCount }), [digestCount, articleCount, cardCount]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-ink text-parchment">
      <AnimatePresence>
        {landingVisible && (
          <motion.section
            key="landing"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            className="relative overflow-hidden px-6 py-8 lg:px-12 lg:py-12"
          >
            <div className="absolute inset-0 bg-vignette opacity-80 pointer-events-none"></div>
            <div className="relative mx-auto flex max-w-7xl flex-col gap-12 lg:flex-row lg:items-center">
              <div className="flex-1 space-y-6">
                <div className="inline-flex items-center gap-3 rounded-full bg-white/6 px-4 py-2 text-sm text-amberSoft ring-1 ring-white/10 backdrop-blur">
                  premium law study OS · offline-first · designed for focus
                </div>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <p className="text-sm uppercase tracking-[0.32em] text-stone-300">The Operating System for Law Students</p>
                    <h1 className="text-4xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-6xl">
                      The second brain for case law, codal mastery, flashcards, and courtroom readiness.
                    </h1>
                    <p className="max-w-2xl text-base leading-8 text-stone-300">
                      Convert your law school workload into a cinematic productivity experience with distraction-free digest management, annotated statutes, adaptive flashcards, and an immersive objection simulator.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <Button onClick={() => { setLandingVisible(false); setActiveView('overview'); }}>
                      Enter Dashboard
                    </Button>
                    <Button variant="ghost" onClick={() => toggleAmbient()}>
                      {ambientMode ? 'Ambient Mode On' : 'Activate Ambient Mode'}
                    </Button>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {['Case Digests', 'Codal Companion', 'Flashcards', 'Objection Simulator'].map((feature) => (
                    <Card key={feature} className="border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                      <p className="text-sm uppercase tracking-[0.3em] text-stone-400">{feature}</p>
                      <p className="mt-3 text-base text-stone-100">A polished workspace to capture law school insight and sharpen courtroom instincts.</p>
                    </Card>
                  ))}
                </div>
              </div>
              <div className="relative w-full max-w-2xl">
                <div className="glass-panel relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-soft backdrop-blur-xl">
                  <div className="absolute -right-16 -top-12 h-48 w-48 rounded-full bg-amberSoft/10 blur-3xl" />
                  <div className="space-y-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.32em] text-stone-400">Today’s focus</p>
                        <h2 className="text-2xl font-semibold text-white">Milestones & action plan</h2>
                      </div>
                      <div className="rounded-2xl bg-amberSoft/10 px-3 py-2 text-xs text-amberSoft">offline</div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {Object.entries(deckSummary).map(([label, value]) => (
                        <div key={label} className="rounded-3xl border border-white/10 bg-black/30 p-5">
                          <p className="text-xs uppercase tracking-[0.32em] text-stone-400">{label}</p>
                          <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-3xl bg-black/20 p-5 ring-1 ring-white/10">
                      <p className="text-sm text-stone-300">Quick preview</p>
                      <div className="mt-4 space-y-3 text-sm text-stone-100">
                        <p>• Keep your case digests lean with 1-minute summaries.</p>
                        <p>• Annotate statutes with plain-English notes and cross-links.</p>
                        <p>• Drill with flashcards and simulated objections every day.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink via-transparent" />
          </motion.section>
        )}
      </AnimatePresence>
      {!landingVisible && (
        <div className="relative grid min-h-screen grid-cols-1 gap-6 px-4 pb-12 pt-6 lg:grid-cols-[280px_1fr] lg:px-8 xl:px-12">
          <aside className="space-y-7 rounded-[32px] border border-white/10 bg-black/30 p-6 shadow-glow backdrop-blur-xl">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.4em] text-stone-500">Law School OS</p>
              <h2 className="text-3xl font-semibold text-white">Command Center</h2>
              <p className="text-sm leading-6 text-stone-400">Navigate with keyboard shortcuts, launch modules, and maintain momentum.</p>
            </div>
            <div className="space-y-3">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`group flex w-full items-center gap-3 rounded-3xl border px-4 py-3 text-left transition ${
                    activeView === item.id ? 'border-amberSoft/50 bg-amberSoft/10 text-white' : 'border-white/10 text-stone-300 hover:border-white/20 hover:bg-white/5'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.32em] text-stone-500">Focus mode</p>
                  <p className="mt-1 text-sm text-stone-300">{ambientMode ? 'Ambient study active' : 'Standard workflow'}</p>
                </div>
                <button onClick={() => toggleAmbient()} className="rounded-2xl bg-white/5 px-3 py-2 text-sm text-white transition hover:bg-white/10">
                  {ambientMode ? 'Pause' : 'Enable'}
                </button>
              </div>
            </div>
            <div className="grid gap-3 rounded-3xl border border-white/10 bg-black/20 p-5">
              <div className="flex items-center justify-between gap-2 text-sm text-stone-300">
                <span>Theme</span>
                <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="rounded-full bg-white/5 px-3 py-2 transition hover:bg-white/10">
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
              </div>
              <div className="rounded-3xl bg-white/5 p-4 text-sm text-stone-200">
                <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Shortcut</p>
                <p className="mt-2 text-sm">Cmd/Ctrl + K opens the command palette.</p>
              </div>
            </div>
          </aside>
          <main className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
              <Card className="border border-white/10 bg-black/40 p-6 shadow-soft backdrop-blur-xl">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.32em] text-stone-400">Daily intelligence</p>
                    <h1 className="mt-3 text-3xl font-semibold text-white">Your law study pulse</h1>
                  </div>
                  <Badge>{quote}</Badge>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-3xl bg-white/5 p-5">
                    <p className="text-xs uppercase tracking-[0.28em] text-stone-500">Sessions</p>
                    <p className="mt-3 text-3xl font-semibold text-white">{Math.max(1, Math.floor(Math.random() * 5))}</p>
                  </div>
                  <div className="rounded-3xl bg-white/5 p-5">
                    <p className="text-xs uppercase tracking-[0.28em] text-stone-500">Module flow</p>
                    <p className="mt-3 text-3xl font-semibold text-white">{activeView.toUpperCase()}</p>
                  </div>
                  <div className="rounded-3xl bg-white/5 p-5">
                    <p className="text-xs uppercase tracking-[0.28em] text-stone-500">Progress</p>
                    <p className="mt-3 text-3xl font-semibold text-white">{Math.min(100, Math.round(((digestCount + articleCount + cardCount) / 20) * 100))}%</p>
                  </div>
                </div>
              </Card>
              <section className="space-y-4">
                <Card className="border border-white/10 bg-black/30 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.32em] text-stone-500">Live activity</p>
                      <h2 className="mt-2 text-xl font-semibold text-white">Study heatmap</h2>
                    </div>
                    <button onClick={toggleCommand} className="rounded-2xl bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10">
                      Command
                    </button>
                  </div>
                  <div className="mt-6 grid grid-cols-7 gap-2">
                    {Array.from({ length: 28 }).map((_, index) => (
                      <div key={index} className={`h-10 rounded-2xl ${index % 5 === 0 ? 'bg-amberSoft/90' : 'bg-white/10'}`} />
                    ))}
                  </div>
                </Card>
                <Card className="border border-white/10 bg-black/30 p-5">
                  <p className="text-xs uppercase tracking-[0.32em] text-stone-500">Search</p>
                  <div className="mt-4 flex items-center gap-3 rounded-3xl border border-white/10 bg-black/20 p-4">
                    <Input value={heroSearch} onChange={(e) => setHeroSearch(e.target.value)} placeholder="Search your vault, passages, or cards..." />
                    <Button variant="secondary" onClick={() => setActiveView('digests')}>Go</Button>
                  </div>
                </Card>
              </section>
            </div>
            <section>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeView}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.25 }}
                >
                  {activeView === 'overview' && (
                    <div className="space-y-6">
                      <Card className="border border-white/10 bg-black/30 p-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.32em] text-stone-500">Overview</p>
                            <h2 className="mt-2 text-2xl font-semibold text-white">Your study command center</h2>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            <Badge>Offline-first</Badge>
                            <Badge>Auto-save</Badge>
                            <Badge>Study analytics</Badge>
                          </div>
                        </div>
                      </Card>
                      <div className="grid gap-6 lg:grid-cols-3">
                        <Card className="border border-white/10 bg-black/30 p-5">
                          <p className="text-sm uppercase tracking-[0.32em] text-stone-400">Pinned</p>
                          <h3 className="mt-3 text-xl font-semibold text-white">Codal provisions</h3>
                          <p className="mt-2 text-sm text-stone-300">Keep important articles ready for instant reference during moot or review sessions.</p>
                        </Card>
                        <Card className="border border-white/10 bg-black/30 p-5">
                          <p className="text-sm uppercase tracking-[0.32em] text-stone-400">Streak</p>
                          <h3 className="mt-3 text-xl font-semibold text-white">{Math.max(3, Math.floor(Math.random() * 10))} days</h3>
                          <p className="mt-2 text-sm text-stone-300">Your consistency score for flashcard review and objection training.</p>
                        </Card>
                        <Card className="border border-white/10 bg-black/30 p-5">
                          <p className="text-sm uppercase tracking-[0.32em] text-stone-400">Next action</p>
                          <h3 className="mt-3 text-xl font-semibold text-white">Complete 1-minute digest</h3>
                          <p className="mt-2 text-sm text-stone-300">Build momentum with quick notes, then move to courtroom simulation.</p>
                        </Card>
                      </div>
                    </div>
                  )}
                  {activeView === 'digests' && <CaseDigests />}
                  {activeView === 'codal' && <CodalCompanion />}
                  {activeView === 'flashcards' && <Flashcards />}
                  {activeView === 'objections' && <ObjectionSimulator />}
                  {activeView === 'settings' && (
                    <Card className="border border-white/10 bg-black/30 p-6">
                      <h2 className="text-2xl font-semibold text-white">Workspace settings</h2>
                      <p className="mt-4 text-sm leading-7 text-stone-300">Backup your vault, restore offline data, and personalize the mood of your study environment.</p>
                    </Card>
                  )}
                </motion.div>
              </AnimatePresence>
            </section>
          </main>
          {isCommandOpen && <CommandPalette />} 
          {!onboardingSeen && <OnboardingModal onDismiss={() => { setOnboardingSeen(); }} />}
        </div>
      )}
    </div>
  );
}
