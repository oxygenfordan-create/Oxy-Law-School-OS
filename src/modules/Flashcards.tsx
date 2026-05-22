import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Dice1, Repeat, Sparkles, Timer } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';

export function Flashcards() {
  const cards = useStore((state) => state.cards);
  const decks = useStore((state) => state.decks);
  const updateCard = useStore((state) => state.updateCard);
  const [deckId, setDeckId] = useState(decks[0]?.id ?? '');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [timedMode, setTimedMode] = useState(false);
  const [timer, setTimer] = useState(30);

  const deckCards = useMemo(() => cards.filter((card) => card.deckId === deckId), [cards, deckId]);
  const dueCards = useMemo(() => deckCards.filter((card) => new Date(card.nextReview) <= new Date()), [deckCards]);
  const currentCard = dueCards[currentIndex] ?? deckCards[currentIndex] ?? deckCards[0];

  useEffect(() => {
    if (!timedMode) return;
    const interval = setInterval(() => setTimer((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(interval);
  }, [timedMode]);

  useEffect(() => {
    setTimer(30);
  }, [currentCard]);

  const review = (feedback: 'easy' | 'medium' | 'hard') => {
    if (!currentCard) return;
    const masteryIncrement = feedback === 'easy' ? 2 : feedback === 'medium' ? 1 : 0;
    const daysAhead = feedback === 'hard' ? 1 : feedback === 'medium' ? 3 : 7;
    updateCard(currentCard.id, {
      mastery: Math.min(5, currentCard.mastery + masteryIncrement),
      lastReviewed: new Date().toISOString(),
      nextReview: new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000).toISOString(),
      difficulty: feedback === 'hard' ? 'hard' : feedback === 'medium' ? 'medium' : 'easy'
    });
    setShowBack(false);
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, dueCards.length));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.32em] text-stone-500">Module</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Flashcard Studio</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-300">Flip through law-focused flashcards, build mastery, and track your daily review streak.</p>
        </div>
        <Button variant="secondary" onClick={() => setTimedMode((value) => !value)}>
          <Timer className="mr-2 h-4 w-4" /> {timedMode ? 'Disable Timer' : 'Timer Mode'}
        </Button>
      </div>
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.3fr]">
        <section className="space-y-5">
          <Card className="border border-white/10 bg-black/30 p-6 shadow-soft">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.32em] text-stone-500">Deck</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">{decks.find((deck) => deck.id === deckId)?.title ?? 'Select deck'}</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {decks.map((deck) => (
                  <button key={deck.id} onClick={() => setDeckId(deck.id)} className={`rounded-2xl px-4 py-2 text-sm transition ${deckId === deck.id ? 'bg-amberSoft text-ink' : 'bg-white/5 text-white hover:bg-white/10'}`}>
                    {deck.title}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.32em] text-stone-400">Due cards</p>
                <p className="mt-3 text-3xl font-semibold text-white">{dueCards.length}</p>
              </div>
              <div className="rounded-3xl bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.32em] text-stone-400">Deck size</p>
                <p className="mt-3 text-3xl font-semibold text-white">{deckCards.length}</p>
              </div>
              <div className="rounded-3xl bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.32em] text-stone-400">Mastery</p>
                <p className="mt-3 text-3xl font-semibold text-white">{Math.round(deckCards.reduce((total, card) => total + card.mastery, 0) / Math.max(1, deckCards.length))}/5</p>
              </div>
            </div>
          </Card>
          <Card className="border border-white/10 bg-black/30 p-8 shadow-soft">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-stone-500">Flashcard</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">{currentCard?.front ?? 'No cards found'}</h3>
              </div>
              <div className="rounded-3xl bg-amberSoft/10 px-3 py-2 text-sm text-amberSoft">Flip to reveal</div>
            </div>
            <div className="mt-8 rounded-[32px] bg-white/5 p-8 text-stone-200 shadow-soft transition hover:bg-white/10">
              <p className="text-base leading-8">{showBack ? currentCard?.back : currentCard?.front}</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => setShowBack((value) => !value)}>
                <ArrowRight className="mr-2 h-4 w-4" /> {showBack ? 'Show Front' : 'Show Back'}
              </Button>
              <Button variant="secondary" onClick={() => review('easy')}>Easy</Button>
              <Button variant="secondary" onClick={() => review('medium')}>Medium</Button>
              <Button variant="secondary" onClick={() => review('hard')}>Hard</Button>
            </div>
            {timedMode && (
              <div className="mt-4 rounded-3xl bg-black/20 p-4 text-sm text-stone-300">
                <div className="flex items-center justify-between">
                  <p>Time left</p>
                  <p>{timer}s</p>
                </div>
              </div>
            )}
          </Card>
        </section>
        <section className="space-y-5">
          <Card className="border border-white/10 bg-black/30 p-6 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.32em] text-stone-500">Study analytics</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Session snapshot</h3>
              </div>
              <Sparkles className="h-6 w-6 text-amberSoft" />
            </div>
            <div className="mt-6 space-y-4 text-sm text-stone-300">
              <p>• Current deck: {decks.find((deck) => deck.id === deckId)?.title}</p>
              <p>• Next review: {new Date(currentCard?.nextReview ?? Date.now()).toLocaleDateString()}</p>
              <p>• Remaining due cards: {dueCards.length}</p>
            </div>
          </Card>
          <Card className="border border-white/10 bg-black/30 p-6 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.32em] text-stone-500">Refresh</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Shuffle mode</h3>
              </div>
              <Dice1 className="h-6 w-6 text-stone-400" />
            </div>
            <p className="mt-4 text-sm leading-7 text-stone-300">Rotate through difficult cards, challenge your recall, and keep tense review cycles sharp.</p>
            <div className="mt-5 flex gap-3">
              <Button variant="ghost" onClick={() => setCurrentIndex((prev) => (prev + 1) % Math.max(1, dueCards.length))}>Next Card</Button>
              <Button variant="ghost" onClick={() => setCurrentIndex(0)}>Reset</Button>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
