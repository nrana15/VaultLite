export function ReviewSummary() {
  const stats = [
    { label: 'Due Today', value: 12 },
    { label: 'Overdue', value: 3 },
    { label: 'Upcoming', value: 24 },
    { label: 'Mastery', value: '71%' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">{stat.label}</p>
          <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
