import { useMemo, useState } from 'react';
import { useVaultStore } from '../../state/vaultStore';
import type { VaultItem } from '../../types/domain';

function pickRandom<T>(items: T[], n: number): T[] {
  const copy = [...items];
  const out: T[] = [];
  while (copy.length && out.length < n) {
    const idx = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

function similarity(a: string, b: string): number {
  const x = a.trim().toLowerCase();
  const y = b.trim().toLowerCase();
  if (!x || !y) return 0;
  const xSet = new Set(x.split(/\W+/).filter(Boolean));
  const ySet = new Set(y.split(/\W+/).filter(Boolean));
  let overlap = 0;
  xSet.forEach((w) => {
    if (ySet.has(w)) overlap += 1;
  });
  return Math.round((overlap / Math.max(xSet.size, ySet.size, 1)) * 100);
}

export function DailyRecall() {
  const items = useVaultStore((s) => s.items);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const pack = useMemo(() => {
    const concepts = pickRandom(items.filter((i) => i.knowledgeType === 'Concept'), 5);
    const sql = pickRandom(items.filter((i) => i.knowledgeType === 'SQL Query'), 2);
    const architecture = pickRandom(items.filter((i) => i.knowledgeType === 'Architecture'), 1);
    return [...concepts, ...sql, ...architecture];
  }, [items]);

  const updateAnswer = (id: string, value: string) => setAnswers((prev) => ({ ...prev, [id]: value }));

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800">Daily Recall Mode</h3>
      <p className="mt-1 text-xs text-slate-500">5 concepts + 2 SQL snippets + 1 architecture flow.</p>
      <div className="mt-3 space-y-3">
        {pack.map((item: VaultItem) => {
          const userAnswer = answers[item.id] ?? '';
          const score = similarity(userAnswer, item.content);
          const isRevealed = !!revealed[item.id];

          return (
            <article key={item.id} className="rounded-xl border border-slate-200 p-3">
              <p className="text-sm font-medium text-slate-800">{item.title}</p>
              <textarea
                value={userAnswer}
                onChange={(e) => updateAnswer(item.id, e.target.value)}
                className="mt-2 min-h-20 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
                placeholder="Type your recall answer before revealing..."
              />
              <div className="mt-2 flex items-center gap-3">
                <button
                  onClick={() => setRevealed((prev) => ({ ...prev, [item.id]: true }))}
                  className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  Reveal
                </button>
                <span className="text-xs text-slate-500">Similarity: {score}%</span>
              </div>
              {isRevealed ? <p className="mt-2 text-sm text-slate-600">{item.content}</p> : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
