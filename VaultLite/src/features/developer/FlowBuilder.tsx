import { useEffect, useMemo, useState } from 'react';
import { developerRepository, type FlowEdge, type FlowNode, type SavedFlow } from './repository';

export function FlowBuilder() {
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [edges, setEdges] = useState<FlowEdge[]>([]);
  const [nodeLabel, setNodeLabel] = useState('');
  const [nodeMinutes, setNodeMinutes] = useState('10');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [edgeLabel, setEdgeLabel] = useState('');
  const [saved, setSaved] = useState(false);
  const [savedFlows, setSavedFlows] = useState<SavedFlow[]>([]);
  const [selectedFlowId, setSelectedFlowId] = useState('');
  const [runChecks, setRunChecks] = useState<Record<string, boolean>>({});

  const selectedFlow = useMemo(
    () => savedFlows.find((f) => f.id === selectedFlowId),
    [savedFlows, selectedFlowId],
  );

  const loadFlows = async () => {
    const flows = await developerRepository.listFlows();
    setSavedFlows(flows);
  };

  useEffect(() => {
    void loadFlows();
  }, []);

  const addNode = () => {
    if (!nodeLabel.trim()) return;
    const id = `n-${Math.random().toString(36).slice(2, 8)}`;
    const mins = Number.parseInt(nodeMinutes, 10);
    const label = Number.isFinite(mins) && mins > 0 ? `${nodeLabel.trim()} (${mins}m)` : nodeLabel.trim();
    setNodes((prev) => [...prev, { id, label, x: prev.length * 140, y: 20 }]);
    setNodeLabel('');
  };

  const addEdge = () => {
    if (!from || !to || from === to) return;
    setEdges((prev) => [...prev, { from, to, label: edgeLabel.trim() || undefined }]);
    setEdgeLabel('');
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800">Flow Builder</h3>
      <p className="mt-1 text-xs text-slate-500">Build reusable playbooks with steps, branches, and run checklist mode.</p>

      <div className="mt-3 grid grid-cols-4 gap-2">
        <input
          value={nodeLabel}
          onChange={(e) => setNodeLabel(e.target.value)}
          className="col-span-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
          placeholder="Step label (e.g. Reproduce bug)"
        />
        <input
          value={nodeMinutes}
          onChange={(e) => setNodeMinutes(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          placeholder="Est. mins"
        />
        <button onClick={addNode} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">Add Step</button>
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
        <input value={edgeLabel} onChange={(e) => setEdgeLabel(e.target.value)} className="rounded-lg border border-slate-200 px-2 py-2 text-sm" placeholder="Decision label" />
        <button onClick={addEdge} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">Connect</button>
      </div>

      <div className="mt-3 rounded-lg border border-dashed border-slate-300 p-3">
        <p className="text-xs text-slate-500">Steps</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {nodes.map((n) => <span key={n.id} className="rounded bg-slate-100 px-2 py-1 text-xs">{n.label}</span>)}
        </div>
        <p className="mt-3 text-xs text-slate-500">Branches</p>
        <ul className="mt-1 list-disc pl-5 text-xs text-slate-600">
          {edges.map((e, i) => <li key={`${e.from}-${e.to}-${i}`}>{e.from} → {e.to}{e.label ? ` (${e.label})` : ''}</li>)}
        </ul>
      </div>

      <button
        onClick={async () => {
          await developerRepository.saveFlow({ nodes, edges });
          setSaved(true);
          setNodes([]);
          setEdges([]);
          await loadFlows();
          setTimeout(() => setSaved(false), 1500);
        }}
        className="mt-3 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white"
      >
        Save Flow
      </button>
      {saved ? <p className="mt-2 text-xs text-emerald-600">Flow saved.</p> : null}

      <div className="mt-4 rounded-xl border border-slate-200 p-3">
        <h4 className="text-xs font-semibold text-slate-700">Run Mode</h4>
        <div className="mt-2 flex items-center gap-2">
          <select
            value={selectedFlowId}
            onChange={(e) => {
              setSelectedFlowId(e.target.value);
              setRunChecks({});
            }}
            className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"
          >
            <option value="">Select saved flow...</option>
            {savedFlows.map((f) => (
              <option key={f.id} value={f.id}>
                {new Date(f.createdAt).toLocaleString()} · {f.flow.nodes.length} steps
              </option>
            ))}
          </select>
        </div>

        {selectedFlow ? (
          <div className="mt-3 space-y-2">
            {selectedFlow.flow.nodes.map((n) => (
              <label key={n.id} className="flex items-center gap-2 rounded border border-slate-200 px-2 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!runChecks[n.id]}
                  onChange={(e) => setRunChecks((prev) => ({ ...prev, [n.id]: e.target.checked }))}
                />
                <span>{n.label}</span>
              </label>
            ))}
            <p className="text-xs text-slate-500">
              Progress: {Object.values(runChecks).filter(Boolean).length}/{selectedFlow.flow.nodes.length} completed
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
