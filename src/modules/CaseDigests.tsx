import { useMemo, useState } from 'react';
import { ChevronDown, Download, Search, Star, Trash2, Plus, Pencil, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';

const defaultDigest = {
  title: '',
  citation: '',
  topic: '',
  facts: '',
  issue: '',
  ruling: '',
  doctrine: '',
  separateOpinions: '',
  notes: '',
  tags: [''],
  favorite: false
};

function parseCaseText(rawText: string) {
  const normalized = rawText.trim().replace(/\r/g, '');
  const lines = normalized.split('\n').map((line) => line.trim());

  // Extract title and citation from the top
  let title = '';
  let citation = '';
  let contentStart = 0;

  // First non-empty line is often the case name
  if (lines.length > 0 && lines[0]) {
    title = lines[0];
    contentStart = 1;
  }

  // Look for citation in the next few lines (contains numbers, court abbreviations, or year)
  for (let i = contentStart; i < Math.min(contentStart + 5, lines.length); i++) {
    if (/(\d{1,3}\s+[A-Z]{0,3}\s+\d{3}|U\.S\.|S\.Ct\.|F\.|No\.|Case No\.|[0-9]{4})/.test(lines[i])) {
      citation = lines[i];
      contentStart = i + 1;
      break;
    }
  }

  // Extract section headers more robustly
  const sectionPatterns: Record<string, RegExp> = {
    facts: /^(FACTS|Facts|STATEMENT OF FACTS|Statement of Facts|Background|Background Facts|Relevant Facts)[:\.]?\s*$/i,
    issue: /^(ISSUE|Issues|Issue|LEGAL ISSUE|Legal Issues|Question Presented|Question Presented)[:\.]?\s*$/i,
    ruling: /^(RULING|Holding|HOLDING|Decision|DECISION|Court's Decision|Court's Holding)[:\.]?\s*$/i,
    doctrine: /^(DOCTRINE|Rule of Law|RULE OF LAW|Legal Rule|Applicable Law|APPLICABLE LAW|Analysis|ANALYSIS|Discussion|DISCUSSION)[:\.]?\s*$/i,
    opinions: /^(SEPARATE OPINIONS|Concurring|CONCURRING|Dissenting|DISSENTING|Dissent|Opinion)[:\.]?\s*$/i
  };

  const sections: Record<string, string[]> = {
    facts: [],
    issue: [],
    ruling: [],
    doctrine: [],
    opinions: []
  };

  let currentSection = 'facts';
  let contentLines = lines.slice(contentStart).filter(Boolean);

  contentLines.forEach((line) => {
    // Check if this line is a section header
    let foundHeader = false;
    for (const [sectionKey, pattern] of Object.entries(sectionPatterns)) {
      if (pattern.test(line)) {
        currentSection = sectionKey;
        foundHeader = true;
        break;
      }
    }

    // If it's not a header, add it to the current section
    if (!foundHeader && line.length > 0) {
      sections[currentSection].push(line);
    }
  });

  // Join sections and clean up
  const joinSection = (sectionContent: string[]): string =>
    sectionContent.join(' ').replace(/\s+/g, ' ').trim();

  // If we didn't find explicit sections, use heuristics to split paragraphs
  if (
    !Object.values(sections).some((section) => section.length > 0) &&
    contentLines.length > 0
  ) {
    const paragraphs = contentLines
      .join('\n')
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);

    return {
      title: title.trim(),
      citation: citation.trim(),
      facts: paragraphs[0] || '',
      issue: paragraphs[1] || '',
      ruling: paragraphs[2] || '',
      doctrine: paragraphs[3] || '',
      separateOpinions: paragraphs.slice(4).join('\n\n') || ''
    };
  }

  return {
    title: title.trim(),
    citation: citation.trim(),
    facts: joinSection(sections.facts),
    issue: joinSection(sections.issue),
    ruling: joinSection(sections.ruling),
    doctrine: joinSection(sections.doctrine),
    separateOpinions: joinSection(sections.opinions)
  };
}

export function CaseDigests() {
  const digests = useStore((state) => state.digests);
  const createDigest = useStore((state) => state.createDigest);
  const updateDigest = useStore((state) => state.updateDigest);
  const removeDigest = useStore((state) => state.removeDigest);
  const toggleFavoriteDigest = useStore((state) => state.toggleFavoriteDigest);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultDigest);
  const [rawCaseText, setRawCaseText] = useState('');
  const [parseError, setParseError] = useState('');
  const [parsedPreview, setParsedPreview] = useState<ReturnType<typeof parseCaseText> | null>(null);
  const [showTimeline, setShowTimeline] = useState(false);

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return digests.filter((digest) =>
      [digest.title, digest.citation, digest.topic, digest.facts, digest.issue, digest.notes]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [digests, search]);

  const handleSelect = (digestId: string) => {
    const selected = digests.find((item) => item.id === digestId);
    if (!selected) return;
    setEditingId(digestId);
    setForm({
      title: selected.title,
      citation: selected.citation,
      topic: selected.topic,
      facts: selected.facts,
      issue: selected.issue,
      ruling: selected.ruling,
      doctrine: selected.doctrine,
      separateOpinions: selected.separateOpinions,
      notes: selected.notes,
      tags: selected.tags,
      favorite: selected.favorite
    });
  };

  const handleExport = (digestId: string) => {
    const digest = digests.find((item) => item.id === digestId);
    if (!digest) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>${digest.title}</title><style>body{font-family:system-ui;color:#111;background:#f3efe7;padding:40px;}h1{font-size:32px;}h2{font-size:18px;}p{line-height:1.7;}</style></head><body>
      <h1>${digest.title}</h1>
      <p><strong>Citation:</strong> ${digest.citation}</p>
      <p><strong>Topic:</strong> ${digest.topic}</p>
      <h2>Facts</h2><p>${digest.facts}</p>
      <h2>Issue</h2><p>${digest.issue}</p>
      <h2>Ruling</h2><p>${digest.ruling}</p>
      <h2>Doctrine</h2><p>${digest.doctrine}</p>
      <h2>Separate Opinions</h2><p>${digest.separateOpinions}</p>
      <h2>Notes</h2><p>${digest.notes}</p>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const selectedDigest = editingId ? digests.find((item) => item.id === editingId) : digests[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.32em] text-stone-500">Module</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Case Digest Manager</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-300">Build concise legal summaries, tag critical doctrine, and export crisp briefs for rapid review.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => { const id = createDigest(defaultDigest); setEditingId(id); }}>
            <Plus className="mr-2 h-4 w-4" /> New Digest
          </Button>
          <Button variant="secondary" onClick={() => setShowTimeline((value) => !value)}>
            <ChevronDown className="mr-2 h-4 w-4" /> Timeline
          </Button>
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.3fr]">
        <section className="space-y-5">
          <div className="rounded-[32px] border border-white/10 bg-black/30 p-5 shadow-soft backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-stone-300">
                <Search className="h-4 w-4" />
                <span className="text-sm">Search digests</span>
              </div>
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by case, topic, or issue" />
            </div>
          </div>
          <Card className="rounded-[32px] border border-white/10 bg-black/30 p-5 shadow-soft backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.32em] text-stone-500">Parse case text</p>
                <h3 className="mt-2 text-xl font-semibold text-white">Extract fields accurately</h3>
              </div>
            </div>
            <div className="mt-4 rounded-3xl bg-white/5 p-4 text-xs leading-6 text-stone-400">
              <p className="font-semibold text-stone-300">Best results:</p>
              <ul className="mt-2 space-y-1">
                <li>• Paste the full court opinion or case brief text</li>
                <li>• Case name and citation should appear at the top</li>
                <li>• Section headers (FACTS, ISSUE, RULING, etc.) help with extraction</li>
                <li>• Edit any section manually after parsing if needed</li>
              </ul>
            </div>
            <Textarea
              className="mt-4 min-h-[180px]"
              value={rawCaseText}
              onChange={(event) => setRawCaseText(event.target.value)}
              placeholder="Paste a case opinion, judgment, or case brief here to auto-populate the digest fields."
            />
            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                onClick={() => {
                  try {
                    const parsed = parseCaseText(rawCaseText);
                    setParsedPreview(parsed);
                    setForm((state) => ({
                      ...state,
                      title: parsed.title || state.title,
                      citation: parsed.citation || state.citation,
                      facts: parsed.facts || state.facts,
                      issue: parsed.issue || state.issue,
                      ruling: parsed.ruling || state.ruling,
                      doctrine: parsed.doctrine || state.doctrine,
                      separateOpinions: parsed.separateOpinions || state.separateOpinions
                    }));
                    setParseError('');
                  } catch (error) {
                    setParseError('Unable to parse the case text. Please ensure it contains headings like Facts, Issue, or Ruling.');
                    setParsedPreview(null);
                  }
                }}
              >
                Parse Case
              </Button>
              <Button variant="ghost" onClick={() => { setRawCaseText(''); setParseError(''); setParsedPreview(null); }}>
                Clear Input
              </Button>
            </div>
            {parseError && <p className="mt-3 text-sm text-rose-400">{parseError}</p>}
            {parsedPreview && (
              <div className="mt-6 space-y-4 rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.32em] text-stone-400">Parsed preview — edit below before saving</div>
                <div className="grid gap-3 text-xs text-stone-300">
                  {parsedPreview.title && (
                    <div>
                      <p className="font-semibold text-white">Title</p>
                      <p className="mt-1 line-clamp-2">{parsedPreview.title}</p>
                    </div>
                  )}
                  {parsedPreview.citation && (
                    <div>
                      <p className="font-semibold text-white">Citation</p>
                      <p className="mt-1 line-clamp-2">{parsedPreview.citation}</p>
                    </div>
                  )}
                  {parsedPreview.facts && (
                    <div>
                      <p className="font-semibold text-white">Facts</p>
                      <p className="mt-1 line-clamp-3">{parsedPreview.facts}</p>
                    </div>
                  )}
                  {parsedPreview.issue && (
                    <div>
                      <p className="font-semibold text-white">Issue</p>
                      <p className="mt-1 line-clamp-3">{parsedPreview.issue}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
          <div className="grid gap-4">
            {filtered.map((digest) => (
              <Card key={digest.id} className="group overflow-hidden border-white/10 bg-black/20 p-5 transition hover:border-amberSoft/40 hover:bg-white/5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{digest.title}</p>
                    <p className="mt-1 text-xs text-stone-400">{digest.citation}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleFavoriteDigest(digest.id)} className="text-amberSoft">
                      <Star className={`h-4 w-4 ${digest.favorite ? 'fill-current' : ''}`} />
                    </button>
                    <button onClick={() => handleSelect(digest.id)} className="rounded-2xl bg-white/5 px-3 py-2 text-xs text-stone-200 hover:bg-white/10">
                      Edit
                    </button>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-stone-400">
                  {digest.tags.map((tag, index) => (
                    <span key={index} className="rounded-full bg-white/5 px-3 py-1">{tag}</span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </section>
        <section className="space-y-5">
          <Card className="border border-white/10 bg-black/30 p-6 shadow-soft">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.32em] text-stone-500">Focused editor</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">{selectedDigest ? selectedDigest.title || 'Untitled digest' : 'Select a digest'}</h3>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="secondary" onClick={() => selectedDigest && handleExport(selectedDigest.id)}>
                  <Download className="mr-2 h-4 w-4" /> Export PDF
                </Button>
                {selectedDigest && (
                  <button onClick={() => removeDigest(selectedDigest.id)} className="rounded-2xl bg-white/5 px-3 py-2 text-sm text-stone-200 hover:bg-white/10">
                    <Trash2 className="mr-2 inline h-4 w-4" /> Delete
                  </button>
                )}
              </div>
            </div>
            <div className="mt-6 grid gap-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input value={form.title} onChange={(event) => setForm((state) => ({ ...state, title: event.target.value }))} placeholder="Case Title" />
                <Input value={form.citation} onChange={(event) => setForm((state) => ({ ...state, citation: event.target.value }))} placeholder="Citation" />
              </div>
              <Input value={form.topic} onChange={(event) => setForm((state) => ({ ...state, topic: event.target.value }))} placeholder="Topic" />
              <div className="grid gap-4">
                <Textarea value={form.facts} onChange={(event) => setForm((state) => ({ ...state, facts: event.target.value }))} placeholder="Facts" />
                <Textarea value={form.issue} onChange={(event) => setForm((state) => ({ ...state, issue: event.target.value }))} placeholder="Issue" />
                <Textarea value={form.ruling} onChange={(event) => setForm((state) => ({ ...state, ruling: event.target.value }))} placeholder="Ruling" />
                <Textarea value={form.doctrine} onChange={(event) => setForm((state) => ({ ...state, doctrine: event.target.value }))} placeholder="Doctrine" />
                <Textarea value={form.separateOpinions} onChange={(event) => setForm((state) => ({ ...state, separateOpinions: event.target.value }))} placeholder="Separate Opinions" />
                <Textarea value={form.notes} onChange={(event) => setForm((state) => ({ ...state, notes: event.target.value }))} placeholder="Personal Notes" />
              </div>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => {
                  if (editingId && selectedDigest) {
                    updateDigest(selectedDigest.id, { ...form, tags: form.tags.filter(Boolean) });
                  } else {
                    const id = createDigest({ ...form, tags: form.tags.filter(Boolean) });
                    setEditingId(id);
                  }
                  setEditingId(null);
                }}>
                  <Pencil className="mr-2 h-4 w-4" /> Save Digest
                </Button>
                <Button variant="ghost" onClick={() => { setEditingId(null); setForm(defaultDigest); }}>
                  <Sparkles className="mr-2 h-4 w-4" /> Reset
                </Button>
              </div>
            </div>
          </Card>
          {showTimeline && (
            <Card className="border border-white/10 bg-black/30 p-6 shadow-soft">
              <p className="text-sm uppercase tracking-[0.32em] text-stone-500">History</p>
              <div className="mt-4 space-y-4 text-sm text-stone-300">
                {digests.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="rounded-3xl bg-white/5 p-4">
                    <p className="text-sm font-semibold text-white">{entry.title || 'Untitled digest'}</p>
                    <p className="mt-1 text-xs text-stone-400">Updated {new Date(entry.updatedAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
