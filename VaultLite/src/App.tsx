import { useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ReviewSummary } from './features/review/ReviewSummary';
import { ReviewSession } from './features/review/ReviewSession';
import { DailyRecall } from './features/review/DailyRecall';
import { VaultEditor } from './features/vault/VaultEditor';
import { VaultList } from './features/vault/VaultList';
import { FlowBuilder } from './features/developer/FlowBuilder';
import { ProductionPatternForm } from './features/developer/ProductionPatternForm';
import { AnalyticsPanel } from './features/analytics/AnalyticsPanel';
import { VaultLock } from './features/settings/VaultLock';
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
          <AnalyticsPanel />
          <FlowBuilder />
          <ProductionPatternForm />
          <VaultLock />
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="font-medium">Phase 5 complete</h3>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
              <li>Analytics: retention, streak, difficult topics, review heatmap</li>
              <li>Vault lock: password + inactivity auto-lock (local only)</li>
              <li>Security helper service integrated for local credential checks</li>
            </ul>
          </section>
        </aside>
      </main>
      <ReviewSession />
    </div>
  );
}
