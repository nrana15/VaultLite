import { useMemo, useState } from 'react';
import { vaultRepository } from './repository';
import { useVaultStore } from '../../state/vaultStore';
import type { KnowledgeType } from '../../types/domain';

const templates: Record<KnowledgeType, string> = {
  Concept: 'Definition:\nWhen to use:\nCommon mistakes:\nExample:\n',
  Process: 'Goal:\nPrerequisites:\nSteps:\nValidation:\nRollback:\n',
  'SQL Query': '-- Goal:\n-- Inputs:\nSELECT ...\nFROM ...\nWHERE ...;\n-- Explain plan notes:\n',
  Configuration: 'Service:\nEnvironment:\nConfig key:\nRecommended value:\nRisk if wrong:\n',
  'Debug Pattern': 'Symptom:\nSignals/logs:\nHypothesis:\nHow to verify:\nFix:\n',
  Architecture: 'Context:\nDecision:\nTradeoffs:\nAlternatives considered:\n',
  'Issue Resolution': 'Incident summary:\nRoot cause:\nFix applied:\nValidation:\nFollow-up actions:\n',
  'Interview Question': 'Question:\nExpected answer:\nRed flags:\nFollow-up question:\n',
  Checklist: '- [ ] Step 1\n- [ ] Step 2\n- [ ] Verify outcome\n',
  'Production Pattern': 'Problem:\nImpact:\nRoot cause:\nFix:\nPrevention:\n',
};

const suggestedTags: Record<KnowledgeType, string[]> = {
  Concept: ['theory', 'core'],
  Process: ['workflow', 'runbook'],
  'SQL Query': ['sql', 'db'],
  Configuration: ['config', 'env'],
  'Debug Pattern': ['debug', 'troubleshoot'],
  Architecture: ['design', 'system'],
  'Issue Resolution': ['incident', 'fix'],
  'Interview Question': ['interview', 'prep'],
  Checklist: ['checklist', 'ops'],
  'Production Pattern': ['production', 'postmortem'],
};

export function VaultEditor() {
  const createItem = useVaultStore((s) => s.createItem);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [knowledgeType, setKnowledgeType] = useState<KnowledgeType>('Concept');

  const canSubmit = useMemo(() => title.trim().length > 0 && content.trim().length > 0, [title, content]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-800">New Knowledge Item</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setContent((prev) => (prev.trim() ? `${prev}\n\n${templates[knowledgeType]}` : templates[knowledgeType]))}
            className="rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50"
          >
            Use Template
          </button>
          <button
            onClick={() => {
              const merged = new Set(
                tags
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean),
              );
              suggestedTags[knowledgeType].forEach((t) => merged.add(t));
              setTags(Array.from(merged).join(', '));
            }}
            className="rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50"
          >
            Suggest Tags
          </button>
        </div>
      </div>

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
        <p className="text-xs text-slate-500">Template helper active for: {knowledgeType}</p>
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
