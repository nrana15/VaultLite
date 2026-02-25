import { useReviewStore } from '../../state/reviewStore';

const ratings: Array<{ label: string; value: 0 | 1 | 2 | 3; className: string }> = [
  { label: 'Again', value: 0, className: 'bg-rose-600 hover:bg-rose-500' },
  { label: 'Hard', value: 1, className: 'bg-amber-600 hover:bg-amber-500' },
  { label: 'Good', value: 2, className: 'bg-emerald-600 hover:bg-emerald-500' },
  { label: 'Easy', value: 3, className: 'bg-indigo-600 hover:bg-indigo-500' },
];

export function ReviewSession() {
  const active = useReviewStore((s) => s.active);
  const dueCards = useReviewStore((s) => s.dueCards);
  const showAnswer = useReviewStore((s) => s.showAnswer);
  const reveal = useReviewStore((s) => s.reveal);
  const rate = useReviewStore((s) => s.rate);
  const close = useReviewStore((s) => s.close);

  if (!active) return null;

  const card = dueCards[0];
  if (!card) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 text-white">
        <div className="rounded-2xl border border-white/20 bg-white/10 p-8 text-center">
          <p className="text-lg font-semibold">All caught up. No due cards left.</p>
          <button onClick={close} className="mt-4 rounded-lg bg-white px-4 py-2 text-slate-900">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 p-6 text-white">
      <button onClick={close} className="absolute right-6 top-6 rounded-md border border-white/30 px-3 py-1 text-sm">
        Exit
      </button>
      <div className="w-full max-w-4xl space-y-6 rounded-2xl border border-white/20 bg-white/5 p-8">
        <p className="text-sm text-white/70">
          Card 1 of {dueCards.length} · {card.type}
        </p>
        <h2 className="text-3xl font-semibold leading-relaxed">{card.question}</h2>

        {!showAnswer ? (
          <button onClick={reveal} className="rounded-lg bg-white px-5 py-2 font-medium text-slate-900">
            Show Answer
          </button>
        ) : (
          <>
            <div className="rounded-xl border border-white/25 bg-white/10 p-4 text-lg leading-relaxed text-white/95">
              {card.answer}
            </div>
            <div className="grid grid-cols-4 gap-3">
              {ratings.map((r) => (
                <button
                  key={r.label}
                  onClick={() => void rate(r.value)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${r.className}`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
