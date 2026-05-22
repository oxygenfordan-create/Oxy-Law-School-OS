export type StorageSchema = {
  digests: CaseDigest[];
  articles: CodalArticle[];
  decks: FlashcardDeck[];
  cards: FlashcardCard[];
  objections: ObjectionRound[];
  settings: AppSettings;
  activity: AnalyticsState;
};

export type CaseDigest = {
  id: string;
  title: string;
  citation: string;
  topic: string;
  facts: string;
  issue: string;
  ruling: string;
  doctrine: string;
  separateOpinions: string;
  notes: string;
  tags: string[];
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CodalArticle = {
  id: string;
  number: string;
  title: string;
  text: string;
  plainEnglish: string;
  annotations: string;
  bookmarks: boolean;
  color: 'amber' | 'stone' | 'violet';
  related: string[];
};

export type FlashcardCard = {
  id: string;
  deckId: string;
  front: string;
  back: string;
  difficulty: 'easy' | 'hard' | 'medium';
  mastery: number;
  nextReview: string;
  lastReviewed: string;
  isDifficult: boolean;
};

export type FlashcardDeck = {
  id: string;
  title: string;
  description: string;
};

export type ObjectionRound = {
  id: string;
  category: string;
  prompt: string;
  options: string[];
  answer: string;
  explanation: string;
};

export type AppSettings = {
  theme: 'dark' | 'light';
  activeView: string;
  onboardingSeen: boolean;
  ambientMode: boolean;
};

export type AnalyticsState = {
  sessions: number;
  reviewStreak: number;
  totalCards: number;
  activeDays: string[];
  lastReset: string;
};

const DB_NAME = 'law-school-os-v1';
const DB_VERSION = 1;
const STORE_NAMES = ['digests', 'articles', 'decks', 'cards', 'objections', 'settings', 'activity'] as const;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      STORE_NAMES.forEach((store) => {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: 'id' });
        }
      });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function transaction<T>(store: string, mode: IDBTransactionMode, operation: (store: IDBObjectStore) => void): Promise<T> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, mode);
    const objectStore = tx.objectStore(store);
    operation(objectStore);
    tx.oncomplete = () => resolve(undefined as unknown as T);
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAll<T>(store: string): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const request = tx.objectStore(store).getAll();
    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(request.error);
  });
}

export async function getItem<T>(store: string, id: string): Promise<T | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const request = tx.objectStore(store).get(id);
    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(request.error);
  });
}

export async function putItem(store: string, item: unknown): Promise<void> {
  await transaction(store, 'readwrite', (objectStore) => {
    objectStore.put(item);
  });
}

export async function deleteItem(store: string, id: string): Promise<void> {
  await transaction(store, 'readwrite', (objectStore) => {
    objectStore.delete(id);
  });
}

export async function clearStore(store: string): Promise<void> {
  await transaction(store, 'readwrite', (objectStore) => {
    objectStore.clear();
  });
}

export async function exportBackup(): Promise<string> {
  const backup: Partial<StorageSchema> = {};
  await Promise.all(
    STORE_NAMES.map(async (store) => {
      backup[store] = await getAll(store);
    })
  );
  return JSON.stringify(backup, null, 2);
}

export async function importBackup(json: string): Promise<void> {
  const data = JSON.parse(json) as Partial<StorageSchema>;
  await Promise.all(
    STORE_NAMES.map(async (store) => {
      if (data[store]) {
        await clearStore(store);
        for (const item of data[store] as any[]) {
          await putItem(store, item);
        }
      }
    })
  );
}

export function persistentTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark';
  return (window.localStorage.getItem('law-school-theme') as 'dark' | 'light') ?? 'dark';
}

export function saveTheme(theme: 'dark' | 'light') {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem('law-school-theme', theme);
}
