import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { AlertCircle, Clock3, Edit3, ShieldCheck } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import type { ObjectionRound } from '../lib/storage';

const categories = ['All', 'Hearsay', 'Leading Questions', 'Argumentative', 'Compound', 'Irrelevant', 'Opinion', 'Best Evidence Rule', 'Privileged Communication', 'Res Gestae', 'Dying Declaration', 'Character Evidence'];

export function ObjectionSimulator() {
  const objections = useStore((state) => state.objections);
  const updateObjection = useStore((state) => state.updateObjection);
  const [rounds, setRounds] = useState<ObjectionRound[]>(objections);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [roundIndex, setRoundIndex] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(20);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    setRounds(objections);
  }, [objections]);

  const filteredRounds = useMemo(
    () => rounds.filter((round) => selectedCategory === 'All' || round.category === selectedCategory),
    [selectedCategory, rounds]
  );

  const round = filteredRounds[roundIndex % Math.max(1, filteredRounds.length)];

  const handleAnswer = (option: string) => {
    if (!round) return;
    const correct = option === round.answer;
    setFeedback(correct ? 'Correct — keep the courtroom tempo.' : 'Missed it — review the rule and try again.');
    setScore((current) => current + (correct ? 1 : 0));
  };

  const nextRound = () => {
    setRoundIndex((value) => value + 1);
    setFeedback(null);
    setTimer(20);
  };

  const handleFieldChange = (field: keyof ObjectionRound, value: string) => {
    if (!round) return;
    setRounds((current) =>
      current.map((item) =>
        item.id === round.id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleOptionChange = (index: number, value: string) => {
    if (!round) return;
    setRounds((current) =>
      current.map((item) =>
        item.id === round.id
          ? { ...item, options: item.options.map((option, optionIndex) => (optionIndex === index ? value : option)) }
          : item
      )
    );
  };

  const handleSave = () => {
    if (!round) return;
    updateObjection(round.id, round);
    setEditMode(false);
    setFeedback('Changes saved. Continue training.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.32em] text-stone-500">Signature feature</p>
          <div className="flex items-center gap-3">
            <h2 className="mt-2 text-3xl font-semibold text-white">Objection Simulator</h2>
            <button
              onClick={() => setEditMode((current) => !current)}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-stone-100 transition hover:border-white/20 hover:bg-white/10"
            >
              <Edit3 className="h-4 w-4" />
              {editMode ? 'Exit Edit' : 'Edit'}
            </button>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-300">Practice rapid objection calls, build instinctive rule recognition, and train for terror professor moments.</p>
        </div>
        <Badge>Score: {score}</Badge>
      </div>
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.3fr]">
        <section className="space-y-5">
          <Card className="border border-white/10 bg-black/30 p-6 shadow-soft">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-stone-500">Round</p>
                {editMode ? (
                  <input
                    className="mt-2 w-full rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-2xl font-semibold text-white outline-none focus:border-amberSoft/60 focus:ring-2 focus:ring-amberSoft/20"
                    value={round?.category ?? ''}
                    onChange={(event) => handleFieldChange('category', event.target.value)}
                    placeholder="Category"
                  />
                ) : (
                  <h3 className="mt-2 text-2xl font-semibold text-white">{round?.category ?? 'Ready?'}</h3>
                )}
              </div>
              <div className="rounded-3xl bg-white/10 px-4 py-2 text-sm text-stone-100">
                <Clock3 className="mr-2 inline h-4 w-4" /> {timer}s
              </div>
            </div>
            <div className="mt-6 rounded-[32px] bg-white/5 p-8 text-stone-200 shadow-soft">
              {editMode ? (
                <textarea
                  className="min-h-[160px] w-full rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-white outline-none transition focus:border-amberSoft/60 focus:ring-2 focus:ring-amberSoft/20"
                  value={round?.prompt ?? ''}
                  onChange={(event) => handleFieldChange('prompt', event.target.value)}
                  placeholder="Edit the objection prompt here"
                />
              ) : (
                <p className="text-lg leading-8">{round?.prompt}</p>
              )}
            </div>
            <div className="mt-6 grid gap-3">
              {round?.options.map((option, index) => (
                editMode ? (
                  <input
                    key={`${round.id}-option-${index}`}
                    className="w-full rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-amberSoft/60 focus:ring-2 focus:ring-amberSoft/20"
                    value={option}
                    onChange={(event) => handleOptionChange(index, event.target.value)}
                    placeholder={`Option ${index + 1}`}
                  />
                ) : (
                  <Button key={`${round.id}-option-${index}`} onClick={() => handleAnswer(option)}>{option}</Button>
                )
              ))}
            </div>
            {editMode && (
              <div className="mt-5 rounded-3xl bg-white/5 p-4 text-sm text-stone-200">
                <div className="space-y-3">
                  <p className="font-semibold text-white">Correct answer</p>
                  <select
                    className="w-full rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-amberSoft/60 focus:ring-2 focus:ring-amberSoft/20"
                    value={round?.answer ?? ''}
                    onChange={(event) => handleFieldChange('answer', event.target.value)}
                  >
                    {round?.options.map((option, index) => (
                      <option key={`${round.id}-answer-${index}`} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            {feedback && !editMode && (
              <div className="mt-5 rounded-3xl bg-white/5 p-4 text-sm text-stone-200">
                <div className="flex items-center gap-2 text-amberSoft">
                  {feedback.includes('Correct') ? <ShieldCheck className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  <span>{feedback}</span>
                </div>
              </div>
            )}
            <div className="mt-6 flex flex-wrap gap-3">
              {editMode ? (
                <Button onClick={handleSave}>Save Changes</Button>
              ) : (
                <>
                  <Button variant="secondary" onClick={nextRound}>Next Round</Button>
                  <Button variant="ghost" onClick={() => setScore(0)}>Reset Score</Button>
                </>
              )}
            </div>
          </Card>
        </section>
        <section className="space-y-5">
          <Card className="border border-white/10 bg-black/30 p-6 shadow-soft">
            <p className="text-sm uppercase tracking-[0.32em] text-stone-500">Category</p>
            <div className="mt-4 grid gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => { setSelectedCategory(category); setRoundIndex(0); }}
                  className={`rounded-3xl border px-4 py-3 text-left text-sm transition ${
                    selectedCategory === category ? 'border-amberSoft/40 bg-amberSoft/10 text-white' : 'border-white/10 bg-white/5 text-stone-200 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </Card>
          <Card className="border border-white/10 bg-black/30 p-6 shadow-soft">
            <p className="text-sm uppercase tracking-[0.32em] text-stone-500">Practice tips</p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-stone-300">
              <li>• Listen for witness questions and identify rule triggers.</li>
              <li>• Respond quickly but confidently with the correct objection.</li>
              <li>• Use the explanation block to learn why each objection matters.</li>
            </ul>
          </Card>
        </section>
      </div>
    </div>
  );
}
