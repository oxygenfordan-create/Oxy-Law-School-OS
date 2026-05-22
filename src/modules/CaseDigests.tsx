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
  const lines = normalized.split('\n').map((line) => line.trim()).filter(Boolean);

  // Extract title and citation from the top
  let title = '';
  let citation = '';
  let contentStart = 0;

  if (lines.length > 0 && lines[0]) {
    title = lines[0];
    contentStart = 1;
  }

  // Look for citation in the next few lines
  for (let i = contentStart; i < Math.min(contentStart + 5, lines.length); i++) {
    if (/(\d{1,3}\s+[A-Z]{0,3}\s+\d{3}|U\.S\.|S\.Ct\.|F\.|No\.|Case No\.|[0-9]{4}|[0-9]{4}\s+[A-Z])/.test(lines[i])) {
      citation = lines[i];
      contentStart = i + 1;
      break;
    }
  }

  // Get body text
  const bodyText = lines.slice(contentStart).join('\n');
  const paragraphs = bodyText
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 20);

  // Linguistic heuristics to identify sections
  const identifySection = (text: string): string => {
    const lower = text.toLowerCase();

    // Facts indicators
    if (
      /^(the|on|in|a|defendants?|plaintiff|parties|claimant|appellant|respondent|circumstances?)/i.test(
        text
      ) ||
      /occurred|happened|took place|facts are|background|facts of the case/.test(lower)
    ) {
      return 'facts';
    }

    // Issue indicators
    if (
      /whether|does|did|is|can|should|must|may|shall|the question|the issue|whether or not|was/.test(
        lower
      ) &&
      /\?/.test(text)
    ) {
      return 'issue';
    }
    if (
      /issue|question|problem|dispute|presented|raised|before|court|appellant|respondent/.test(lower) &&
      (text.length > 50 || /is|are|does|do|was|were|should|would/.test(lower))
    ) {
      return 'issue';
    }

    // Ruling/Holding indicators
    if (
      /held|held that|the court|we hold|affirmed|reversed|remanded|judgment|decree|decision|ruled|court concludes/.test(
        lower
      )
    ) {
      return 'ruling';
    }
    if (
      /therefore|thus|accordingly|consequently|for the foregoing|in conclusion|the judgment|the order/.test(
        lower
      )
    ) {
      return 'ruling';
    }

    // Doctrine/Rule indicators
    if (
      /rule|law|principle|doctrine|standard|test|requirement|element|factor|proof|burden|must show|established/.test(
        lower
      ) &&
      text.length > 60
    ) {
      return 'doctrine';
    }

    // Separate opinions
    if (/concur|dissent|agree|disagree|wrote|join|opinion/.test(lower)) {
      return 'opinions';
    }

    // Default based on position
    if (paragraphs.indexOf(text) === 0) return 'facts';
    if (paragraphs.indexOf(text) === 1) return 'issue';
    if (paragraphs.indexOf(text) === paragraphs.length - 1) return 'opinions';
    return 'doctrine';
  };

  // Organize paragraphs by identified section
  const sections: Record<string, string[]> = {
    facts: [],
    issue: [],
    ruling: [],
    doctrine: [],
    opinions: []
  };

  paragraphs.forEach((para) => {
    const section = identifySection(para);
    sections[section].push(para);
  });

  const joinSection = (sectionContent: string[]): string =>
    sectionContent.join('\n\n').trim();

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
  const [editableDigest, setEditableDigest] = useState<ReturnType<typeof parseCaseText> | null>(null);
  const [showQuickDigest, setShowQuickDigest] = useState(false);
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

    // Create a styled HTML document
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${digest.title}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      max-width: 900px;
      margin: 0 auto;
      padding: 40px;
      color: #333;
      line-height: 1.6;
      background: #f9f9f9;
    }
    h1 {
      font-size: 28px;
      margin-bottom: 10px;
      border-bottom: 3px solid #4f8cff;
      padding-bottom: 10px;
    }
    .citation {
      font-size: 14px;
      color: #666;
      font-weight: bold;
      margin-bottom: 20px;
    }
    h2 {
      font-size: 18px;
      margin-top: 25px;
      margin-bottom: 10px;
      color: #4f8cff;
    }
    .section {
      background: white;
      padding: 15px;
      margin-bottom: 15px;
      border-radius: 5px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .topic {
      background: #e3f2fd;
      padding: 10px;
      margin-bottom: 15px;
      border-left: 4px solid #4f8cff;
      border-radius: 3px;
    }
    .tags {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
    }
    .tag {
      display: inline-block;
      background: #4f8cff;
      color: white;
      padding: 5px 10px;
      margin-right: 5px;
      border-radius: 15px;
      font-size: 12px;
    }
    @media print {
      body { background: white; }
      .section { box-shadow: none; border: 1px solid #ddd; }
    }
  </style>
</head>
<body>
  <h1>${digest.title}</h1>
  <div class="citation">Citation: ${digest.citation}</div>
  ${digest.topic ? `<div class="topic"><strong>Topic:</strong> ${digest.topic}</div>` : ''}
  
  ${digest.facts ? `<h2>Facts</h2><div class="section">${digest.facts}</div>` : ''}
  ${digest.issue ? `<h2>Issue</h2><div class="section">${digest.issue}</div>` : ''}
  ${digest.ruling ? `<h2>Ruling</h2><div class="section">${digest.ruling}</div>` : ''}
  ${digest.doctrine ? `<h2>Doctrine</h2><div class="section">${digest.doctrine}</div>` : ''}
  ${digest.separateOpinions ? `<h2>Separate Opinions</h2><div class="section">${digest.separateOpinions}</div>` : ''}
  ${digest.notes ? `<h2>Notes</h2><div class="section">${digest.notes}</div>` : ''}
  
  ${
    digest.tags.length > 0
      ? `<div class="tags">${digest.tags.map((tag) => `<span class="tag">${tag}</span>`).join('')}</div>`
      : ''
  }
</body>
</html>
    `.trim();

    // Open in new window and trigger print
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to export as PDF');
      return;
    }
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
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
                    setEditableDigest(parsed);
                    setParseError('');
                    setShowQuickDigest(true);
                  } catch (error) {
                    setParseError('Unable to parse the case text. Please check the content and try again.');
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
                <div className="text-xs uppercase tracking-[0.32em] text-stone-400">Parsed preview — edit inline and save below</div>
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

      {showQuickDigest && editableDigest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <Card className="max-h-[90vh] w-full max-w-4xl overflow-y-auto border border-white/10 bg-black/95 p-8 shadow-soft">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.32em] text-stone-500">Quick Digest</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Refine and save your case</h2>
              </div>
              <button onClick={() => setShowQuickDigest(false)} className="text-2xl text-stone-400 hover:text-white">×</button>
            </div>
            <div className="mt-6 grid gap-4">
              <div>
                <label className="text-sm font-semibold text-stone-300">Case Title</label>
                <input
                  className="mt-2 w-full rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-amberSoft/60 focus:ring-2 focus:ring-amberSoft/20"
                  value={editableDigest.title}
                  onChange={(e) => setEditableDigest({ ...editableDigest, title: e.target.value })}
                  placeholder="Case name"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-stone-300">Citation</label>
                <input
                  className="mt-2 w-full rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-amberSoft/60 focus:ring-2 focus:ring-amberSoft/20"
                  value={editableDigest.citation}
                  onChange={(e) => setEditableDigest({ ...editableDigest, citation: e.target.value })}
                  placeholder="Citation"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-stone-300">Facts</label>
                <textarea
                  className="mt-2 min-h-[100px] w-full rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-amberSoft/60 focus:ring-2 focus:ring-amberSoft/20"
                  value={editableDigest.facts}
                  onChange={(e) => setEditableDigest({ ...editableDigest, facts: e.target.value })}
                  placeholder="Facts of the case"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-stone-300">Issue</label>
                <textarea
                  className="mt-2 min-h-[80px] w-full rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-amberSoft/60 focus:ring-2 focus:ring-amberSoft/20"
                  value={editableDigest.issue}
                  onChange={(e) => setEditableDigest({ ...editableDigest, issue: e.target.value })}
                  placeholder="Legal issue or question presented"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-stone-300">Ruling</label>
                <textarea
                  className="mt-2 min-h-[100px] w-full rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-amberSoft/60 focus:ring-2 focus:ring-amberSoft/20"
                  value={editableDigest.ruling}
                  onChange={(e) => setEditableDigest({ ...editableDigest, ruling: e.target.value })}
                  placeholder="The court's ruling or holding"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-stone-300">Doctrine / Rule of Law</label>
                <textarea
                  className="mt-2 min-h-[100px] w-full rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-amberSoft/60 focus:ring-2 focus:ring-amberSoft/20"
                  value={editableDigest.doctrine}
                  onChange={(e) => setEditableDigest({ ...editableDigest, doctrine: e.target.value })}
                  placeholder="Legal doctrine or principle established"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => {
                    const newDigest = createDigest({
                      title: editableDigest.title || 'Untitled Case',
                      citation: editableDigest.citation,
                      facts: editableDigest.facts,
                      issue: editableDigest.issue,
                      ruling: editableDigest.ruling,
                      doctrine: editableDigest.doctrine,
                      separateOpinions: editableDigest.separateOpinions,
                      topic: '',
                      tags: []
                    });
                    setShowQuickDigest(false);
                    setRawCaseText('');
                    setParsedPreview(null);
                    setEditableDigest(null);
                    alert('Case digest saved successfully!');
                  }}
                >
                  Save Digest
                </Button>
                <Button variant="ghost" onClick={() => setShowQuickDigest(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
