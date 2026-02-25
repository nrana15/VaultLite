import { useMemo } from 'react';
import { Search } from 'lucide-react';
import { useVaultStore } from '../../state/vaultStore';
import { KnowledgeTypeBadge } from './KnowledgeTypeBadge';

export function VaultList() {
  const items = useVaultStore((s) => s.items);
  const query = useVaultStore((s) => s.query);
  const loading = useVaultStore((s) => s.loading);
  const error = useVaultStore((s) => s.error);
  const setQuery = useVaultStore((s) => s.setQuery);

  const summary = useMemo(() => {
    const conceptCount = items.filter((i) => i.knowledgeType === 'Concept').length;
    const sqlCount = items.filter((i) => i.knowledgeType === 'SQL Query').length;
    return { total: items.length, conceptCount, sqlCount };
  }, [items]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-800">Vault Items</h3>
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-2 py-1">
          <Search size={14} className="text-slate-400" />
          <input
            value={query}
            onChange={(e) => void setQuery(e.target.value)}
            placeholder="Search concepts, SQL, patterns..."
            className="w-72 border-none bg-transparent text-sm outline-none"
          />
        </div>
      </div>

      <p className="mt-2 text-xs text-slate-500">
        {summary.total} total · {summary.conceptCount} concepts · {summary.sqlCount} SQL snippets
      </p>

      {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
      {loading ? <p className="mt-3 text-sm text-slate-500">Loading...</p> : null}

      <div className="mt-3 space-y-3">
        {items.map((item) => (
          <article key={item.id} className="rounded-xl border border-slate-200 p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h4 className="font-medium text-slate-900">{item.title}</h4>
              <KnowledgeTypeBadge knowledgeType={item.knowledgeType} />
            </div>
            <p className="max-h-16 overflow-hidden text-sm text-slate-600">{item.content}</p>
            {item.tags.length ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span key={`${item.id}-${tag}`} className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
