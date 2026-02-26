import { useEffect } from 'react';
import { useAnalyticsStore } from '../../state/analyticsStore';

export function AnalyticsPanel() {
  const snapshot = useAnalyticsStore((s) => s.snapshot);
  const loading = useAnalyticsStore((s) => s.loading);
  const load = useAnalyticsStore((s) => s.load);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">Analytics</h3>
        <button onClick={() => void load()} className="rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50">
          Refresh
        </button>
      </div>
      {loading ? <p className="mt-2 text-sm text-slate-500">Loading analytics...</p> : null}

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Stat label="Total Concepts" value={snapshot.totalConcepts} />
        <Stat label="Retention Rate" value={`${snapshot.retentionRate}%`} />
        <Stat label="Review Streak" value={`${snapshot.reviewStreak} days`} />
        <Stat label="Difficult Topics" value={snapshot.difficultTopics.length} />
      </div>

      <div className="mt-4">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Most Difficult Topics</h4>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
          {snapshot.difficultTopics.map((d) => (
            <li key={d.title}>
              {d.title} — {d.misses} misses
            </li>
          ))}
          {!snapshot.difficultTopics.length ? <li>No misses recorded yet.</li> : null}
        </ul>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-600">How this analytics works</h4>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-600">
          <li>Retention Rate = % of review events rated Good/Easy (rating ≥ 2).</li>
          <li>Review Streak = consecutive days with at least one review event.</li>
          <li>Difficult Topics = items with most “Again” ratings (rating = 0).</li>
          <li>Heatmap = review count per day (darker = more reviews).</li>
        </ul>
      </div>

      <div className="mt-4">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Mastery Heatmap (last 60 days)</h4>
        <div className="mt-2 grid grid-cols-10 gap-1">
          {snapshot.heatmap.map((h) => (
            <div
              key={h.day}
              title={`${h.day}: ${h.count} reviews`}
              className="h-4 rounded"
              style={{ backgroundColor: `rgba(79,70,229, ${Math.min(0.15 + h.count / 12, 1)})` }}
            />
          ))}
          {!snapshot.heatmap.length ? <p className="col-span-10 text-sm text-slate-500">No review activity yet.</p> : null}
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </div>
  );
}
