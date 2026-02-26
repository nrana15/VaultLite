import { useEffect, useState } from 'react';
import { Sidebar, type NavTab } from './components/Sidebar';
import { ReviewSummary } from './features/review/ReviewSummary';
import { ReviewSession } from './features/review/ReviewSession';
import { DailyRecall } from './features/review/DailyRecall';
import { VaultEditor } from './features/vault/VaultEditor';
import { VaultList } from './features/vault/VaultList';
import { FlowBuilder } from './features/developer/FlowBuilder';
import { ProductionPatternForm } from './features/developer/ProductionPatternForm';
import { AnalyticsPanel } from './features/analytics/AnalyticsPanel';
import { VaultLock } from './features/settings/VaultLock';
import { ImportExportPanel } from './features/settings/ImportExportPanel';
import { ReadinessChecklist } from './features/settings/ReadinessChecklist';
import { useVaultStore } from './state/vaultStore';
import { useReviewStore } from './state/reviewStore';

export function App() {
  const load = useVaultStore((s) => s.load);
  const loadReview = useReviewStore((s) => s.load);
  const [activeTab, setActiveTab] = useState<NavTab>('Vault');

  useEffect(() => {
    void load();
    void loadReview();
  }, [load, loadReview]);

  return (
    <div className="flex h-screen">
      <Sidebar activeTab={activeTab} onSelect={setActiveTab} />
      <main className="grid flex-1 grid-cols-[1fr_360px] gap-6 p-6">
        <section className="space-y-4 overflow-auto pr-1">
          {(activeTab === 'Vault' || activeTab === 'Review') && (
            <>
              <VaultEditor />
              <VaultList />
              <DailyRecall />
            </>
          )}

          {activeTab === 'Analytics' && (
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="font-medium">Analytics</h3>
              <p className="mt-2 text-sm text-slate-600">Review performance and progress insights.</p>
            </section>
          )}

          {activeTab === 'Settings' && (
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="font-medium">Settings</h3>
              <p className="mt-2 text-sm text-slate-600">Manage lock, import/export, and readiness checks.</p>
            </section>
          )}
        </section>

        <aside className="space-y-4 overflow-auto">
          {(activeTab === 'Vault' || activeTab === 'Review') && <ReviewSummary />}
          {(activeTab === 'Vault' || activeTab === 'Analytics') && <AnalyticsPanel />}
          {(activeTab === 'Vault' || activeTab === 'Analytics') && <FlowBuilder />}
          {(activeTab === 'Vault' || activeTab === 'Analytics') && <ProductionPatternForm />}
          {(activeTab === 'Vault' || activeTab === 'Settings') && <VaultLock />}
          {(activeTab === 'Vault' || activeTab === 'Settings') && <ImportExportPanel />}
          {(activeTab === 'Vault' || activeTab === 'Settings') && <ReadinessChecklist />}
          {activeTab === 'Vault' && (
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="font-medium">Phase 7 complete</h3>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
                <li>Portable Windows packaging guide and release workflow</li>
                <li>Production readiness checklist integrated in-app</li>
                <li>Performance instrumentation utility added</li>
              </ul>
            </section>
          )}
        </aside>
      </main>
      <ReviewSession />
    </div>
  );
}
