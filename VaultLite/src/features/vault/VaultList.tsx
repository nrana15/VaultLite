import { useMemo, useState } from 'react';
import { Archive, Pin, Search, Star } from 'lucide-react';
import { useVaultStore } from '../../state/vaultStore';
import { KnowledgeTypeBadge } from './KnowledgeTypeBadge';
import { reviewRepository } from '../review/repository';
import { useReviewStore } from '../../state/reviewStore';
import { vaultRepository } from './repository';

export function VaultList() {
  const items = useVaultStore((s) => s.items);
  const query = useVaultStore((s) => s.query);
  const loading = useVaultStore((s) => s.loading);
  const error = useVaultStore((s) => s.error);
  const setQuery = useVaultStore((s) => s.setQuery);
  const load = useVaultStore((s) => s.load);
  const loadReview = useReviewStore((s) => s.load);

  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'updated' | 'title'>('updated');
  const [showArchived, setShowArchived] = useState(false);
  const [tagFilter, setTagFilter] = useState('');

  const summary = useMemo(() => {
    const conceptCount = items.filter((i) => i.knowledgeType === 'Concept').length;
    const sqlCount = items.filter((i) => i.knowledgeType === 'SQL Query').length;
    const archivedCount = items.filter((i) => i.archived).length;
    return { total: items.length, conceptCount, sqlCount, archivedCount };
  }, [items]);

  const visibleItems = useMemo(() => {
    const tagNeedle = tagFilter.trim().toLowerCase();

    const filtered = items.filter((item) => {
      if (!showArchived && item.archived) return false;
      if (typeFilter !== 'All' && item.knowledgeType !== typeFilter) return false;
      if (tagNeedle && !item.tags.some((t) => t.toLowerCase().includes(tagNeedle))) return false;
      return true;
    });

    return filtered.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [items, showArchived, typeFilter, tagFilter, sortBy]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-800">Vault Library</h3>
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

      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-md border border-slate-200 px-2 py-1"
        >
          <option>All</option>
          {vaultRepository.knowledgeTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <input
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
          placeholder="Filter by tag"
          className="rounded-md border border-slate-200 px-2 py-1"
        />

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'updated' | 'title')}
          className="rounded-md border border-slate-200 px-2 py-1"
        >
          <option value="updated">Sort: Recently Updated</option>
          <option value="title">Sort: Title A-Z</option>
        </select>

        <button
          onClick={() => setShowArchived((v) => !v)}
          className="rounded-md border border-slate-200 px-2 py-1 hover:bg-slate-50"
        >
          {showArchived ? 'Hide Archived' : 'Show Archived'}
        </button>
      </div>

      <p className="mt-2 text-xs text-slate-500">
        {summary.total} total · {summary.conceptCount} concepts · {summary.sqlCount} SQL snippets · {summary.archivedCount}{' '}
        archived
      </p>

      {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
      {loading ? <p className="mt-3 text-sm text-slate-500">Loading...</p> : null}

      <div className="mt-3 space-y-3">
        {visibleItems.map((item) => (
          <article key={item.id} className="rounded-xl border border-slate-200 p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h4 className="font-medium text-slate-900">{item.title}</h4>
              <div className="flex items-center gap-2">
                {item.pinned ? <Star size={14} className="text-amber-500" /> : null}
                {item.archived ? <Archive size={14} className="text-slate-400" /> : null}
                <KnowledgeTypeBadge knowledgeType={item.knowledgeType} />
              </div>
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
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={async () => {
                  await reviewRepository.generateFromItem(item);
                  await loadReview();
                }}
                className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Generate Flashcard
              </button>
              <button
                onClick={async () => {
                  await vaultRepository.togglePinned(item.id, !item.pinned);
                  await load();
                }}
                className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
              >
                <Pin size={12} /> {item.pinned ? 'Unpin' : 'Pin'}
              </button>
              <button
                onClick={async () => {
                  await vaultRepository.toggleArchived(item.id, !item.archived);
                  await load();
                }}
                className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
              >
                <Archive size={12} /> {item.archived ? 'Restore' : 'Archive'}
              </button>
            </div>
          </article>
        ))}

        {!loading && visibleItems.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
            No items match these filters.
          </p>
        ) : null}
      </div>
    </section>
  );
}
