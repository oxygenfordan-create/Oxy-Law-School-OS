import type { CaseDigest, FlashcardCard, ObjectionRound, CodalArticle } from '../lib/storage';

export function downloadFile(filename: string, content: string, mimeType: string = 'text/plain') {
  const element = document.createElement('a');
  element.setAttribute('href', `data:${mimeType};charset=utf-8,${encodeURIComponent(content)}`);
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

export function exportNotesAsTxt(notes: string): void {
  const filename = `law-school-notes-${new Date().toISOString().split('T')[0]}.txt`;
  downloadFile(filename, notes, 'text/plain');
}

export function exportDigestsAsMarkdown(digests: CaseDigest[]): void {
  let markdown = '# Case Digests\n\n';
  markdown += `Exported on ${new Date().toLocaleString()}\n\n`;

  digests.forEach((digest) => {
    markdown += `## ${digest.title}\n\n`;
    markdown += `**Citation:** ${digest.citation}\n\n`;
    markdown += `**Topic:** ${digest.topic}\n\n`;
    markdown += `### Facts\n${digest.facts}\n\n`;
    markdown += `### Issue\n${digest.issue}\n\n`;
    markdown += `### Ruling\n${digest.ruling}\n\n`;
    markdown += `### Doctrine\n${digest.doctrine}\n\n`;
    if (digest.separateOpinions) {
      markdown += `### Separate Opinions\n${digest.separateOpinions}\n\n`;
    }
    if (digest.notes) {
      markdown += `### Notes\n${digest.notes}\n\n`;
    }
    markdown += `**Tags:** ${digest.tags.join(', ')}\n\n---\n\n`;
  });

  const filename = `case-digests-${new Date().toISOString().split('T')[0]}.md`;
  downloadFile(filename, markdown, 'text/markdown');
}

export function exportDigestsAsJson(digests: CaseDigest[]): void {
  const json = JSON.stringify(digests, null, 2);
  const filename = `case-digests-${new Date().toISOString().split('T')[0]}.json`;
  downloadFile(filename, json, 'application/json');
}

export function exportFlashcardsAsCsv(cards: FlashcardCard[]): void {
  let csv = 'Front,Back,Difficulty,Mastery\n';
  cards.forEach((card) => {
    const front = `"${card.front.replace(/"/g, '""')}"`;
    const back = `"${card.back.replace(/"/g, '""')}"`;
    csv += `${front},${back},${card.difficulty},${card.mastery}\n`;
  });

  const filename = `flashcards-${new Date().toISOString().split('T')[0]}.csv`;
  downloadFile(filename, csv, 'text/csv');
}

export function exportFlashcardsAsJson(cards: FlashcardCard[]): void {
  const json = JSON.stringify(cards, null, 2);
  const filename = `flashcards-${new Date().toISOString().split('T')[0]}.json`;
  downloadFile(filename, json, 'application/json');
}

export function exportObjectionsAsJson(objections: ObjectionRound[]): void {
  const json = JSON.stringify(objections, null, 2);
  const filename = `objections-${new Date().toISOString().split('T')[0]}.json`;
  downloadFile(filename, json, 'application/json');
}

export function exportCodalsAsJson(articles: CodalArticle[]): void {
  const json = JSON.stringify(articles, null, 2);
  const filename = `codal-articles-${new Date().toISOString().split('T')[0]}.json`;
  downloadFile(filename, json, 'application/json');
}

export function exportEverything(data: {
  notes: string;
  digests: CaseDigest[];
  flashcards: FlashcardCard[];
  objections: ObjectionRound[];
  codals: CodalArticle[];
}): void {
  const everything = {
    exportedAt: new Date().toISOString(),
    notes: data.notes,
    digests: data.digests,
    flashcards: data.flashcards,
    objections: data.objections,
    codals: data.codals
  };
  const json = JSON.stringify(everything, null, 2);
  const filename = `law-school-os-backup-${new Date().toISOString().split('T')[0]}.json`;
  downloadFile(filename, json, 'application/json');
}
