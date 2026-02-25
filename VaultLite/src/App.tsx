import { Sidebar } from './components/Sidebar';
import { ReviewSummary } from './features/review/ReviewSummary';

export function App() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="grid flex-1 grid-cols-[1fr_360px] gap-6 p-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Knowledge Vault</h2>
          <p className="mt-2 text-sm text-slate-600">
            Core modules are scaffolded. Next: item CRUD, FTS5 search, flashcard generation, and review flows.
          </p>
        </section>
        <aside className="space-y-4">
          <ReviewSummary />
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="font-medium">Architecture baseline</h3>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
              <li>SQLite + FTS5 + migration-first schema</li>
              <li>SM-2 scheduler implemented in services</li>
              <li>Feature folders for Vault, Review, Analytics</li>
            </ul>
          </section>
        </aside>
      </main>
    </div>
  );
}
