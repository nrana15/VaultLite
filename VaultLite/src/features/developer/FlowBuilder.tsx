import { useState } from 'react';
import { developerRepository, type FlowEdge, type FlowNode } from './repository';

export function FlowBuilder() {
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [edges, setEdges] = useState<FlowEdge[]>([]);
  const [nodeLabel, setNodeLabel] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [edgeLabel, setEdgeLabel] = useState('');
  const [saved, setSaved] = useState(false);

  const addNode = () => {
    if (!nodeLabel.trim()) return;
    const id = `n-${Math.random().toString(36).slice(2, 8)}`;
    setNodes((prev) => [...prev, { id, label: nodeLabel.trim(), x: prev.length * 140, y: 20 }]);
    setNodeLabel('');
  };

  const addEdge = () => {
    if (!from || !to) return;
    setEdges((prev) => [...prev, { from, to, label: edgeLabel.trim() || undefined }]);
    setEdgeLabel('');
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800">Flow Builder</h3>
      <p className="mt-1 text-xs text-slate-500">Create simplified process flow nodes and connections.</p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <input value={nodeLabel} onChange={(e) => setNodeLabel(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Node label" />
        <button onClick={addNode} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">Add Node</button>
      </div>

      <div className="mt-2 grid grid-cols-4 gap-2">
        <select value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-lg border border-slate-200 px-2 py-2 text-sm">
          <option value="">From</option>
          {nodes.map((n) => <option key={`f-${n.id}`} value={n.id}>{n.label}</option>)}
        </select>
        <select value={to} onChange={(e) => setTo(e.target.value)} className="rounded-lg border border-slate-200 px-2 py-2 text-sm">
          <option value="">To</option>
          {nodes.map((n) => <option key={`t-${n.id}`} value={n.id}>{n.label}</option>)}
        </select>
        <input value={edgeLabel} onChange={(e) => setEdgeLabel(e.target.value)} className="rounded-lg border border-slate-200 px-2 py-2 text-sm" placeholder="Label" />
        <button onClick={addEdge} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">Connect</button>
      </div>

      <div className="mt-3 rounded-lg border border-dashed border-slate-300 p-3">
        <p className="text-xs text-slate-500">Nodes</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {nodes.map((n) => <span key={n.id} className="rounded bg-slate-100 px-2 py-1 text-xs">{n.label}</span>)}
        </div>
        <p className="mt-3 text-xs text-slate-500">Connections</p>
        <ul className="mt-1 list-disc pl-5 text-xs text-slate-600">
          {edges.map((e, i) => <li key={`${e.from}-${e.to}-${i}`}>{e.from} → {e.to}{e.label ? ` (${e.label})` : ''}</li>)}
        </ul>
      </div>

      <button
        onClick={async () => {
          await developerRepository.saveFlow({ nodes, edges });
          setSaved(true);
          setTimeout(() => setSaved(false), 1500);
        }}
        className="mt-3 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white"
      >
        Save Flow JSON
      </button>
      {saved ? <p className="mt-2 text-xs text-emerald-600">Flow saved.</p> : null}
    </section>
  );
}
