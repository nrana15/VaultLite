import { useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ReviewSummary } from './features/review/ReviewSummary';
import { VaultEditor } from './features/vault/VaultEditor';
import { VaultList } from './features/vault/VaultList';
import { useVaultStore } from './state/vaultStore';

export function App() {
  const load = useVaultStore((s) => s.load);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="grid flex-1 grid-cols-[1fr_360px] gap-6 p-6">
        <section className="space-y-4 overflow-auto pr-1">
          <VaultEditor />
          <VaultList />
        </section>

        <aside className="space-y-4">
          <ReviewSummary />
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="font-medium">Phase 2 complete</h3>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
              <li>Vault CRUD (create/list/search) wired</li>
              <li>FTS5 triggers keep index synced</li>
              <li>Knowledge-type-aware editor and badges</li>
            </ul>
          </section>
        </aside>
      </main>
    </div>
  );
}
