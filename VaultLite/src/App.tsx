import { useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ReviewSummary } from './features/review/ReviewSummary';
import { ReviewSession } from './features/review/ReviewSession';
import { DailyRecall } from './features/review/DailyRecall';
import { VaultEditor } from './features/vault/VaultEditor';
import { VaultList } from './features/vault/VaultList';
import { FlowBuilder } from './features/developer/FlowBuilder';
import { ProductionPatternForm } from './features/developer/ProductionPatternForm';
import { useVaultStore } from './state/vaultStore';
import { useReviewStore } from './state/reviewStore';

export function App() {
  const load = useVaultStore((s) => s.load);
  const loadReview = useReviewStore((s) => s.load);

  useEffect(() => {
    void load();
    void loadReview();
  }, [load, loadReview]);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="grid flex-1 grid-cols-[1fr_360px] gap-6 p-6">
        <section className="space-y-4 overflow-auto pr-1">
          <VaultEditor />
          <VaultList />
          <DailyRecall />
        </section>

        <aside className="space-y-4 overflow-auto">
          <ReviewSummary />
          <FlowBuilder />
          <ProductionPatternForm />
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="font-medium">Phase 4 complete</h3>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
              <li>Daily recall training with typed answers + similarity score</li>
              <li>Flow builder saving node/edge JSON to local DB</li>
              <li>Production pattern tracker with advanced fields</li>
            </ul>
          </section>
        </aside>
      </main>
      <ReviewSession />
    </div>
  );
}
