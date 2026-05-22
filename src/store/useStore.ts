import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import {
  AppSettings,
  AnalyticsState,
  CaseDigest,
  CodalArticle,
  FlashcardCard,
  FlashcardDeck,
  ObjectionRound,
  clearStore,
  deleteItem,
  exportBackup,
  importBackup,
  getAll,
  putItem,
  updateItem,
  saveTheme,
  persistentTheme
} from '../lib/storage';
import { sampleArticles, sampleCards, sampleDecks, sampleDigests, sampleObjections } from '../data/sampleData';

export type ViewMode = 'overview' | 'digests' | 'codal' | 'flashcards' | 'objections' | 'settings';

export type RootState = {
  theme: 'dark' | 'light';
  activeView: ViewMode;
  onboardingSeen: boolean;
  ambientMode: boolean;
  isCommandOpen: boolean;
  search: string;
  selectedDigestId: string | null;
  selectedArticleId: string | null;
  selectedDeckId: string | null;
  selectedCardId: string | null;
  digests: CaseDigest[];
  articles: CodalArticle[];
  decks: FlashcardDeck[];
  cards: FlashcardCard[];
  objections: ObjectionRound[];
  analytics: AnalyticsState;
  quote: string;
  notes: string;
  updateArticle: (id: string, updates: Partial<CodalArticle>) => void;
  createArticle: (article: Partial<CodalArticle>) => string;
  createDeck: (deck: Partial<FlashcardDeck>) => string;
  createCard: (card: Partial<FlashcardCard>) => string;
  deleteCard: (id: string) => void;
  updateCard: (id: string, updates: Partial<FlashcardCard>) => void;
  createObjection: (round: Partial<ObjectionRound>) => string;
  updateObjection: (id: string, updates: Partial<ObjectionRound>) => void;
  deleteObjection: (id: string) => void;
  toggleArticleBookmark: (id: string) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setActiveView: (view: ViewMode) => void;
  toggleAmbient: () => void;
  toggleCommand: () => void;
  setSearch: (value: string) => void;
  setOnboardingSeen: () => void;
  setNotes: (value: string) => void;
  toggleHeatmapDay: (day: string) => void;
  createDigest: (digest: Partial<CaseDigest>) => string;
  updateDigest: (id: string, updates: Partial<CaseDigest>) => void;
  removeDigest: (id: string) => void;
  toggleFavoriteDigest: (id: string) => void;
  saveState: () => Promise<void>;
  importBackup: (json: string) => Promise<void>;
  exportBackup: () => Promise<string>;
  initApp: () => Promise<void>;
};

const defaultAnalytics: AnalyticsState = {
  sessions: 0,
  reviewStreak: 0,
  totalCards: 2,
  activeDays: [],
  lastReset: new Date().toISOString()
};

const initialSettings: AppSettings = {
  theme: persistentTheme(),
  activeView: 'overview',
  onboardingSeen: false,
  ambientMode: false
};

export const useStore = create<RootState>()(
  persist(
    (set, get) => ({
      theme: initialSettings.theme,
      activeView: 'overview',
      onboardingSeen: initialSettings.onboardingSeen,
      ambientMode: false,
      isCommandOpen: false,
      search: '',
      selectedDigestId: null,
      selectedArticleId: null,
      selectedDeckId: 'deck-1',
      selectedCardId: null,
      digests: sampleDigests,
      articles: sampleArticles,
      decks: sampleDecks,
      cards: sampleCards,
      objections: sampleObjections,
      analytics: defaultAnalytics,
      quote: 'Every brief should read like a forensic story, not a textbook chapter.',
      notes: '',
      setTheme: (theme) => {
        saveTheme(theme);
        document.body.classList.toggle('light', theme === 'light');
        set({ theme });
      },
      setActiveView: (view) => set({ activeView: view, isCommandOpen: false }),
      toggleAmbient: () => set((state) => ({ ambientMode: !state.ambientMode })),
      toggleCommand: () => set((state) => ({ isCommandOpen: !state.isCommandOpen })),
      setSearch: (value) => set({ search: value }),
      setOnboardingSeen: () => set({ onboardingSeen: true }),
      setNotes: (value) => set({ notes: value }),
      toggleHeatmapDay: (day) => {
        set((state) => {
          const activeDays = state.analytics.activeDays.includes(day)
            ? state.analytics.activeDays.filter((existing) => existing !== day)
            : [...state.analytics.activeDays, day];
          return { analytics: { ...state.analytics, activeDays } };
        });
      },
      createDigest: (digest) => {
        const id = `digest-${nanoid()}`;
        const now = new Date().toISOString();
        const newDigest: CaseDigest = {
          id,
          title: digest.title ?? '',
          citation: digest.citation ?? '',
          topic: digest.topic ?? '',
          facts: digest.facts ?? '',
          issue: digest.issue ?? '',
          ruling: digest.ruling ?? '',
          doctrine: digest.doctrine ?? '',
          separateOpinions: digest.separateOpinions ?? '',
          notes: digest.notes ?? '',
          favorite: digest.favorite ?? false,
          tags: digest.tags ?? [],
          createdAt: now,
          updatedAt: now
        };
        set((state) => ({ digests: [newDigest, ...state.digests], selectedDigestId: id }));
        return id;
      },
      updateArticle: (id, updates) => {
        set((state) => {
          const articles = state.articles.map((a) => (a.id === id ? { ...a, ...updates } : a));
          const updated = articles.find((a) => a.id === id);
          if (updated) putItem('articles', updated);
          return { articles };
        });
      },
      createArticle: (article) => {
        const id = `article-${nanoid()}`;
        const newArticle: CodalArticle = {
          id,
          number: article.number ?? `Art. ${Math.floor(Math.random() * 1000)}`,
          title: article.title ?? 'Untitled Provision',
          text: article.text ?? '',
          plainEnglish: article.plainEnglish ?? '',
          annotations: article.annotations ?? '',
          bookmarks: article.bookmarks ?? false,
          color: article.color ?? 'amber',
          related: article.related ?? []
        };
        set((state) => ({ articles: [newArticle, ...state.articles] }));
        putItem('articles', newArticle);
        return id;
      },
      toggleArticleBookmark: (id) => {
        set((state) => {
          const articles = state.articles.map((a) => (a.id === id ? { ...a, bookmarks: !a.bookmarks } : a));
          const updated = articles.find((a) => a.id === id);
          if (updated) putItem('articles', updated);
          return { articles };
        });
      },
      createDeck: (deck) => {
        const id = `deck-${nanoid()}`;
        const newDeck: FlashcardDeck = {
          id,
          title: deck.title ?? 'New Deck',
          description: deck.description ?? 'Edit this deck to match your topic.'
        };
        set((state) => ({ decks: [newDeck, ...state.decks], selectedDeckId: id }));
        putItem('decks', newDeck);
        return id;
      },
      createCard: (card) => {
        const id = `card-${nanoid()}`;
        const now = new Date().toISOString();
        const deckId = card.deckId ?? get().selectedDeckId ?? 'deck-1';
        const newCard: FlashcardCard = {
          id,
          deckId,
          front: card.front ?? 'New Question',
          back: card.back ?? 'New Answer',
          difficulty: card.difficulty ?? 'medium',
          mastery: card.mastery ?? 0,
          nextReview: card.nextReview ?? now,
          lastReviewed: card.lastReviewed ?? '',
          isDifficult: card.isDifficult ?? false
        };
        set((state) => ({ cards: [newCard, ...state.cards] }));
        putItem('cards', newCard);
        return id;
      },
      deleteCard: (id) => {
        set((state) => ({ cards: state.cards.filter((card) => card.id !== id) }));
        deleteItem('cards', id);
      },
      updateCard: (id, updates) => {
        set((state) => {
          const cards = state.cards.map((c) => (c.id === id ? { ...c, ...updates } : c));
          const updated = cards.find((c) => c.id === id);
          if (updated) putItem('cards', updated);
          return { cards };
        });
      },
      createObjection: (round) => {
        const id = `objection-${nanoid()}`;
        const options = round.options ?? ['Option 1', 'Option 2', 'Option 3', 'Option 4'];
        const newRound: ObjectionRound = {
          id,
          category: round.category ?? 'Uncategorized',
          prompt: round.prompt ?? 'New objection scenario',
          options,
          answer: round.answer ?? options[0],
          explanation: round.explanation ?? ''
        };
        set((state) => ({ objections: [newRound, ...state.objections] }));
        putItem('objections', newRound);
        return id;
      },
      updateObjection: (id, updates) => {
        set((state) => ({
          objections: state.objections.map((round) => (round.id === id ? { ...round, ...updates } : round))
        }));
      },
      deleteObjection: (id) => set((state) => ({ objections: state.objections.filter((round) => round.id !== id) })),
      updateDigest: (id, updates) => {
        set((state) => ({
          digests: state.digests.map((item) =>
            item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
          )
        }));
      },
      removeDigest: (id) => set((state) => ({ digests: state.digests.filter((item) => item.id !== id) })),
      toggleFavoriteDigest: (id) =>
        set((state) => ({
          digests: state.digests.map((item) => (item.id === id ? { ...item, favorite: !item.favorite } : item))
        })),
      saveState: async () => {
        const state = get();
        await Promise.all([
          ...state.digests.map((digest) => putItem('digests', digest)),
          ...state.articles.map((article) => putItem('articles', article)),
          ...state.decks.map((deck) => putItem('decks', deck)),
          ...state.cards.map((card) => putItem('cards', card)),
          ...state.objections.map((item) => putItem('objections', item)),
          putItem('settings', { id: 'settings', ...initialSettings, theme: state.theme, activeView: state.activeView, onboardingSeen: state.onboardingSeen, ambientMode: state.ambientMode }),
          putItem('activity', { id: 'activity', ...state.analytics })
        ]);
      },
      importBackup: async (json) => {
        await importBackup(json);
        location.reload();
      },
      initApp: async () => {
        try {
          const [digests, articles, decks, cards, objections, settings, activity] = await Promise.all([
            getAll('digests'),
            getAll('articles'),
            getAll('decks'),
            getAll('cards'),
            getAll('objections'),
            getAll('settings'),
            getAll('activity')
          ]);
          set((state) => ({
            digests: digests.length ? digests as CaseDigest[] : state.digests,
            articles: articles.length ? (articles as CodalArticle[]) : state.articles,
            decks: decks.length ? (decks as FlashcardDeck[]) : state.decks,
            cards: cards.length ? (cards as FlashcardCard[]) : state.cards,
            objections: objections.length ? (objections as ObjectionRound[]) : state.objections
          }));
        } catch (e) {
          // ignore - keep samples
        }
      },
      exportBackup: async () => await exportBackup()
    }),
    { name: 'law-school-os-storage', getStorage: () => localStorage }
  )
);
