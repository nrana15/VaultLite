const items = [
  'Offline mode only (no cloud sync)',
  'SQLite/FTS5 initialized in local data path',
  'SM-2 review flow operational',
  'Daily recall + developer mode tools available',
  'Analytics + local vault lock configured',
  'ZIP import/export restore with FTS rebuild',
  'Build and tests passing',
  'Portable Windows packaging guide prepared',
];

export function ReadinessChecklist() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800">Production Readiness</h3>
      <ul className="mt-3 space-y-2 text-sm text-slate-700">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="mt-0.5 text-emerald-600">✓</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
