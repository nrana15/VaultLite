import type { KnowledgeType } from '../../types/domain';

const classes: Record<KnowledgeType, string> = {
  Concept: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Process: 'bg-sky-50 text-sky-700 border-sky-200',
  'SQL Query': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Configuration: 'bg-slate-100 text-slate-700 border-slate-200',
  'Debug Pattern': 'bg-amber-50 text-amber-700 border-amber-200',
  Architecture: 'bg-violet-50 text-violet-700 border-violet-200',
  'Issue Resolution': 'bg-rose-50 text-rose-700 border-rose-200',
  'Interview Question': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  Checklist: 'bg-lime-50 text-lime-700 border-lime-200',
  'Production Pattern': 'bg-orange-50 text-orange-700 border-orange-200',
};

export function KnowledgeTypeBadge({ knowledgeType }: { knowledgeType: KnowledgeType }) {
  return (
    <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${classes[knowledgeType]}`}>
      {knowledgeType}
    </span>
  );
}
