import { useEffect, useMemo, useState } from 'react';
import { developerRepository, type SavedPattern } from './repository';

export function ProductionPatternForm() {
  const [problemDescription, setProblemDescription] = useState('');
  const [rootCause, setRootCause] = useState('');
  const [fix, setFix] = useState('');
  const [sqlUsed, setSqlUsed] = useState('');
  const [prevention, setPrevention] = useState('');
  const [lessonsLearned, setLessonsLearned] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patterns, setPatterns] = useState<SavedPattern[]>([]);
  const [query, setQuery] = useState('');

  const canSave = problemDescription.trim() && rootCause.trim() && fix.trim();

  const loadPatterns = async () => {
    const data = await developerRepository.listPatterns();
    setPatterns(data);
  };

  useEffect(() => {
    void loadPatterns();
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patterns;
    return patterns.filter(
      (p) =>
        p.problemDescription.toLowerCase().includes(q) ||
        p.rootCause.toLowerCase().includes(q) ||
        p.fix.toLowerCase().includes(q) ||
        (p.sqlUsed ?? '').toLowerCase().includes(q),
    );
  }, [patterns, query]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800">Production Pattern Tracker</h3>
      <p className="mt-1 text-xs text-slate-500">Capture incidents and build a searchable production playbook.</p>

      <div className="mt-3 space-y-2">
        <textarea value={problemDescription} onChange={(e) => setProblemDescription(e.target.value)} className="min-h-16 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Problem description" />
        <textarea value={rootCause} onChange={(e) => setRootCause(e.target.value)} className="min-h-16 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Root cause" />
        <textarea value={fix} onChange={(e) => setFix(e.target.value)} className="min-h-16 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Fix" />
        <textarea value={sqlUsed} onChange={(e) => setSqlUsed(e.target.value)} className="min-h-16 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="SQL used" />
        <textarea value={prevention} onChange={(e) => setPrevention(e.target.value)} className="min-h-16 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Prevention" />
        <textarea value={lessonsLearned} onChange={(e) => setLessonsLearned(e.target.value)} className="min-h-16 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Lessons learned" />

        <button
          disabled={!canSave}
          onClick={async () => {
            setError(null);
            try {
              await developerRepository.createPattern({
                problemDescription,
                rootCause,
                fix,
                sqlUsed,
                prevention,
                lessonsLearned,
              });
              setSaved(true);
              setProblemDescription('');
              setRootCause('');
              setFix('');
              setSqlUsed('');
              setPrevention('');
              setLessonsLearned('');
              await loadPatterns();
              setTimeout(() => setSaved(false), 1500);
            } catch (e) {
              setError(e instanceof Error ? e.message : 'Failed to save pattern');
            }
          }}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Save Pattern
        </button>
        {saved ? <p className="text-xs text-emerald-600">Saved.</p> : null}
        {error ? <p className="text-xs text-rose-600">{error}</p> : null}
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 p-3">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-xs font-semibold text-slate-700">Saved Production Patterns</h4>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patterns..."
            className="rounded-md border border-slate-200 px-2 py-1 text-xs"
          />
        </div>
        <div className="mt-2 space-y-2">
          {visible.slice(0, 20).map((p) => (
            <article key={p.id} className="rounded-lg border border-slate-200 p-2">
              <p className="text-xs text-slate-500">{new Date(p.createdAt).toLocaleString()}</p>
              <p className="mt-1 text-sm font-medium text-slate-800">{p.problemDescription}</p>
              <p className="mt-1 text-xs text-slate-600"><span className="font-medium">Root cause:</span> {p.rootCause}</p>
              <p className="mt-1 text-xs text-slate-600"><span className="font-medium">Fix:</span> {p.fix}</p>
            </article>
          ))}
          {visible.length === 0 ? <p className="text-xs text-slate-500">No patterns yet.</p> : null}
        </div>
      </div>
    </section>
  );
}
