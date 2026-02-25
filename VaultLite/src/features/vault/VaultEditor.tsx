import { useMemo, useState } from 'react';
import { vaultRepository } from './repository';
import { useVaultStore } from '../../state/vaultStore';
import type { KnowledgeType } from '../../types/domain';

export function VaultEditor() {
  const createItem = useVaultStore((s) => s.createItem);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [knowledgeType, setKnowledgeType] = useState<KnowledgeType>('Concept');

  const canSubmit = useMemo(() => title.trim().length > 0 && content.trim().length > 0, [title, content]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800">New Knowledge Item</h3>
      <div className="mt-3 space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
          placeholder="Title"
        />
        <select
          value={knowledgeType}
          onChange={(e) => setKnowledgeType(e.target.value as KnowledgeType)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
        >
          {vaultRepository.knowledgeTypes.map((kt) => (
            <option key={kt} value={kt}>
              {kt}
            </option>
          ))}
        </select>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-36 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
          placeholder="Write your concept, query, process, or issue pattern..."
        />
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
          placeholder="Tags (comma-separated)"
        />
        <button
          disabled={!canSubmit}
          onClick={async () => {
            if (!canSubmit) return;
            await createItem({
              title: title.trim(),
              content: content.trim(),
              knowledgeType,
              tags: tags
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean),
            });
            setTitle('');
            setContent('');
            setTags('');
            setKnowledgeType('Concept');
          }}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Save to Vault
        </button>
      </div>
    </section>
  );
}
