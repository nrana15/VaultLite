import { useEffect, useState } from 'react';
import { Sidebar, type NavTab } from './components/Sidebar';
import { ReviewSummary } from './features/review/ReviewSummary';
import { ReviewSession } from './features/review/ReviewSession';
import { DailyRecall } from './features/review/DailyRecall';
import { VaultEditor } from './features/vault/VaultEditor';
import { VaultList } from './features/vault/VaultList';
import { TaskTodoPanel } from './features/tasks/TaskTodoPanel';
import { ProductionPatternForm } from './features/developer/ProductionPatternForm';
import { AnalyticsPanel } from './features/analytics/AnalyticsPanel';
import { CredentialVault } from './features/settings/CredentialVault';
import { ImportExportPanel } from './features/settings/ImportExportPanel';
import { useVaultStore } from './state/vaultStore';
import { useReviewStore } from './state/reviewStore';

export function App() {
  const load = useVaultStore((s) => s.load);
  const loadReview = useReviewStore((s) => s.load);
  const [activeTab, setActiveTab] = useState<NavTab>('Vault');
  const [vaultView, setVaultView] = useState<'capture' | 'library'>('library');

  useEffect(() => {
    void load();
    void loadReview();
  }, [load, loadReview]);

  return (
    <div className="flex h-screen">
      <Sidebar activeTab={activeTab} onSelect={setActiveTab} />
      <main className="grid flex-1 grid-cols-[1fr_360px] gap-6 p-6">
        <section className="space-y-4 overflow-auto pr-1">
          {activeTab === 'Vault' && (
            <div className="flex gap-2 rounded-xl border border-slate-200 bg-white p-2">
              <button
                onClick={() => setVaultView('library')}
                className={`rounded-lg px-3 py-1 text-sm ${vaultView === 'library' ? 'bg-slate-900 text-white' : 'text-slate-700'}`}
              >
                Library
              </button>
              <button
                onClick={() => setVaultView('capture')}
                className={`rounded-lg px-3 py-1 text-sm ${vaultView === 'capture' ? 'bg-slate-900 text-white' : 'text-slate-700'}`}
              >
                Capture
              </button>
            </div>
          )}

          {activeTab === 'Vault' && vaultView === 'capture' && <VaultEditor />}
          {((activeTab === 'Vault' && vaultView === 'library') || activeTab === 'Review') && <VaultList />}
          {((activeTab === 'Vault' && vaultView === 'library') || activeTab === 'Review') && <DailyRecall />}

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
          {(activeTab === 'Vault' || activeTab === 'Settings') && <TaskTodoPanel />}
          {(activeTab === 'Vault' || activeTab === 'Analytics') && <ProductionPatternForm />}
          {(activeTab === 'Vault' || activeTab === 'Settings') && <CredentialVault />}
          {(activeTab === 'Vault' || activeTab === 'Settings') && <ImportExportPanel />}
        </aside>
      </main>
      <ReviewSession />
    </div>
  );
}
