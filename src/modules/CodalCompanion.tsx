import { useMemo, useState } from 'react';
import { Bookmark, Filter, Sparkles, Star, Search } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';

export function CodalCompanion() {
  const articles = useStore((state) => state.articles);
  const updateArticle = useStore((state) => state.updateArticle);
  const toggleArticleBookmark = useStore((state) => state.toggleArticleBookmark);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(articles[0]?.id ?? null);
  const [notes, setNotes] = useState('');
  const [english, setEnglish] = useState('');

  const selectedArticle = articles.find((article) => article.id === selectedId) ?? articles[0];

  useMemo(() => {
    if (selectedArticle) {
      setNotes(selectedArticle.annotations);
      setEnglish(selectedArticle.plainEnglish);
    }
  }, [selectedArticle]);

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return articles.filter((article) =>
      [article.number, article.title, article.text, article.plainEnglish].join(' ').toLowerCase().includes(query)
    );
  }, [articles, search]);

  const handleSave = () => {
    if (!selectedArticle) return;
    updateArticle(selectedArticle.id, { annotations: notes, plainEnglish: english });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.32em] text-stone-500">Module</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Codal Companion</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-300">Search statutes, annotate provisions, and keep important article pins within sight.</p>
        </div>
        <Button variant="secondary" onClick={() => selectedArticle && toggleArticleBookmark(selectedArticle.id)}>
          <Bookmark className="mr-2 h-4 w-4" /> {selectedArticle?.bookmarks ? 'Unpin' : 'Pin'} Article
        </Button>
      </div>
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.3fr]">
        <section className="space-y-5">
          <div className="rounded-[32px] border border-white/10 bg-black/30 p-5 shadow-soft backdrop-blur-xl">
            <div className="flex items-center gap-3 text-sm text-stone-300">
              <Search className="h-4 w-4" />
              <span>Search codal articles</span>
            </div>
            <Input className="mt-4" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find articles by keyword, number, or topic" />
          </div>
          <div className="grid gap-4">
            {filtered.map((article) => (
              <button
                key={article.id}
                onClick={() => setSelectedId(article.id)}
                className={`group flex w-full flex-col gap-3 rounded-3xl border px-5 py-5 text-left transition ${
                  article.id === selectedId ? 'border-amberSoft/50 bg-amberSoft/10 text-white' : 'border-white/10 bg-black/20 text-stone-200 hover:border-white/20 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-stone-500">{article.number}</p>
                    <p className="mt-2 text-lg font-semibold">{article.title}</p>
                  </div>
                  <Star className={`h-5 w-5 ${article.bookmarks ? 'text-amberSoft' : 'text-stone-400'}`} />
                </div>
                <p className="text-sm text-stone-300 line-clamp-2">{article.text}</p>
              </button>
            ))}
          </div>
        </section>
        <section className="space-y-5">
          <Card className="border border-white/10 bg-black/30 p-6 shadow-soft">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.32em] text-stone-500">Article</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">{selectedArticle?.number} • {selectedArticle?.title}</h3>
              </div>
              <Badge>{selectedArticle?.color}</Badge>
            </div>
            <div className="mt-4 space-y-5 text-sm text-stone-300">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-stone-500">Original Text</p>
                <p className="mt-3 whitespace-pre-line rounded-3xl bg-white/5 p-4 text-sm leading-7">{selectedArticle?.text}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-stone-500">Plain English Explanation</p>
                <Textarea value={english} onChange={(event) => setEnglish(event.target.value)} placeholder="Write a concise plain English summary" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-stone-500">Annotations</p>
                <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Add contextual insight, case hooks, or cross-links" />
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button onClick={handleSave}>Save Notes</Button>
              <Button variant="ghost">Open distraction-free</Button>
            </div>
          </Card>
          <Card className="border border-white/10 bg-black/30 p-6 shadow-soft">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.32em] text-stone-500">Related provisions</p>
                <h3 className="mt-2 text-xl font-semibold text-white">Cross-link recommendations</h3>
              </div>
              <Filter className="h-5 w-5 text-stone-400" />
            </div>
            <div className="mt-4 grid gap-3">
              {selectedArticle?.related.map((link) => {
                const related = articles.find((article) => article.id === link);
                if (!related) return null;
                return (
                  <button key={link} onClick={() => setSelectedId(link)} className="rounded-3xl border border-white/10 bg-white/5 p-4 text-left text-stone-200 hover:border-amberSoft/30 hover:bg-amberSoft/10">
                    <p className="text-sm font-semibold text-white">{related.number}</p>
                    <p className="mt-1 text-sm text-stone-300">{related.title}</p>
                  </button>
                );
              })}
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
