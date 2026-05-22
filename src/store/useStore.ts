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
  setTheme: (theme: 'dark' | 'light') => void;
  setActiveView: (view: ViewMode) => void;
  toggleAmbient: () => void;
  toggleCommand: () => void;
  setSearch: (value: string) => void;
  setOnboardingSeen: () => void;
  createDigest: (digest: Omit<CaseDigest, 'id' | 'createdAt' | 'updatedAt'>) => void;
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
      createDigest: (digest) => {
        const id = `digest-${Math.random().toString(36).slice(2, 10)}`;
        const now = new Date().toISOString();
        const newDigest: CaseDigest = {
          id,
          ...digest,
          favorite: false,
          tags: digest.tags ?? [],
          createdAt: now,
          updatedAt: now
        };
        set((state) => ({ digests: [newDigest, ...state.digests], selectedDigestId: id }));
      },
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
      exportBackup: async () => await exportBackup()
    }),
    { name: 'law-school-os-storage', getStorage: () => localStorage }
  )
);
