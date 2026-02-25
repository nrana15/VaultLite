import { useState } from 'react';
import { developerRepository } from './repository';

export function ProductionPatternForm() {
  const [problemDescription, setProblemDescription] = useState('');
  const [rootCause, setRootCause] = useState('');
  const [fix, setFix] = useState('');
  const [sqlUsed, setSqlUsed] = useState('');
  const [prevention, setPrevention] = useState('');
  const [lessonsLearned, setLessonsLearned] = useState('');
  const [saved, setSaved] = useState(false);

  const canSave = problemDescription.trim() && rootCause.trim() && fix.trim();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800">Production Pattern Tracker</h3>
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
            await developerRepository.createPattern({
              problemDescription,
              rootCause,
              fix,
              sqlUsed,
              prevention,
              lessonsLearned,
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 1500);
          }}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Save Pattern
        </button>
        {saved ? <p className="text-xs text-emerald-600">Saved.</p> : null}
      </div>
    </section>
  );
}
