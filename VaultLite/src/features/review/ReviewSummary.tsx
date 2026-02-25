import { useReviewStore } from '../../state/reviewStore';

export function ReviewSummary() {
  const stats = useReviewStore((s) => s.stats);
  const start = useReviewStore((s) => s.start);

  const cards = [
    { label: 'Due Today', value: stats.dueToday },
    { label: 'Overdue', value: stats.overdue },
    { label: 'Upcoming', value: stats.upcoming },
    { label: 'Mastery', value: `${stats.mastery}%` },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {cards.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>
      <button
        onClick={() => void start()}
        className="w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-500"
      >
        Start Review Session
      </button>
    </div>
  );
}
