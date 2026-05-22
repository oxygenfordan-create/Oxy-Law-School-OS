import { CaseDigest, CodalArticle, FlashcardCard, FlashcardDeck, ObjectionRound } from '../lib/storage';

export const sampleDigests: CaseDigest[] = [
  {
    id: 'digest-1',
    title: 'Marbury v. Madison',
    citation: '5 U.S. (1 Cranch) 137 (1803)',
    topic: 'Judicial Review',
    facts: 'Marbury was appointed Justice of the Peace. His commission was withheld and he sought a writ of mandamus against Secretary of State Madison.',
    issue: 'Can the Supreme Court issue a writ of mandamus under the Judiciary Act of 1789?',
    ruling: 'The Court held that the Judiciary Act conflicted with the Constitution and was therefore void. It established the principle of judicial review.',
    doctrine: 'Courts can declare statutes unconstitutional when they exceed authority.',
    separateOpinions: 'No separate opinion; unanimous opinion delivered by Chief Justice Marshall.',
    notes: 'Anchor case for separation of powers. Review the constitutional basis and its modern importance.',
    tags: ['constitutional', 'federal', 'review'],
    favorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const sampleArticles: CodalArticle[] = [
  {
    id: 'article-1',
    number: 'Art. 1.1',
    title: 'Due Process of Law',
    text: 'No person shall be deprived of life, liberty, or property without due process of law.',
    plainEnglish: 'The government must follow fair procedures before taking away your life, freedom, or property.',
    annotations: 'Think about procedural and substantive due process, especially in criminal cases.',
    bookmarks: true,
    color: 'amber',
    related: ['article-2']
  },
  {
    id: 'article-2',
    number: 'Art. 2.3',
    title: 'Search and Seizure',
    text: 'Searches and seizures must be reasonable and supported by probable cause.',
    plainEnglish: 'Police need a valid reason to search you or your belongings.',
    annotations: 'Evaluate exceptions such as consent, plain view, and exigent circumstances.',
    bookmarks: false,
    color: 'stone',
    related: ['article-1']
  }
];

export const sampleDecks: FlashcardDeck[] = [
  {
    id: 'deck-1',
    title: 'Evidence Essentials',
    description: 'Key rules and objection categories for trial practice.'
  }
];

export const sampleCards: FlashcardCard[] = [
  {
    id: 'card-1',
    deckId: 'deck-1',
    front: 'What is the hearsay rule?',
    back: 'Hearsay is an out-of-court statement offered to prove the truth of the matter asserted.',
    difficulty: 'medium',
    mastery: 0,
    nextReview: new Date().toISOString(),
    lastReviewed: '',
    isDifficult: false
  },
  {
    id: 'card-2',
    deckId: 'deck-1',
    front: 'When is a leading question objection appropriate?',
    back: 'On direct examination when the question suggests the answer to the witness.',
    difficulty: 'hard',
    mastery: 0,
    nextReview: new Date().toISOString(),
    lastReviewed: '',
    isDifficult: false
  }
];

export const sampleObjections: ObjectionRound[] = [
  {
    id: 'objection-1',
    category: 'Hearsay',
    prompt: 'A witness testifies that a friend told her the defendant admitted guilt. What objection fits?',
    options: ['Relevance', 'Hearsay', 'Leading', 'Speculation'],
    answer: 'Hearsay',
    explanation: 'The witness is relating an out-of-court statement offered for the truth of the matter asserted.'
  },
  {
    id: 'objection-2',
    category: 'Leading Questions',
    prompt: 'On direct examination, the lawyer asks, "Isn’t it true you saw the defendant holding the weapon?" What objection?',
    options: ['Argumentative', 'Compound', 'Leading', 'Speculation'],
    answer: 'Leading',
    explanation: 'The question suggests the answer and is improper on direct examination.'
  }
];
