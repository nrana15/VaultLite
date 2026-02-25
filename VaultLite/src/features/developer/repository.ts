import { getDb } from '../../database/client';
import { initializeDatabase } from '../../database/migrate';

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function isTauriRuntime() {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

const patternKey = 'vaultlite.production-patterns';
const flowKey = 'vaultlite.process-flows';

export interface ProductionPatternInput {
  problemDescription: string;
  rootCause: string;
  fix: string;
  sqlUsed?: string;
  prevention?: string;
  lessonsLearned?: string;
}

export interface FlowNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface FlowEdge {
  from: string;
  to: string;
  label?: string;
}

export interface FlowPayload {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export const developerRepository = {
  async createPattern(input: ProductionPatternInput) {
    const id = uid('pattern');

    if (!isTauriRuntime()) {
      const raw = localStorage.getItem(patternKey);
      const arr = raw ? (JSON.parse(raw) as unknown[]) : [];
      localStorage.setItem(patternKey, JSON.stringify([{ id, ...input }, ...arr]));
      return id;
    }

    await initializeDatabase();
    const db = await getDb();
    await db.execute(
      `INSERT INTO production_patterns (id, problem_description, root_cause, fix, sql_used, prevention, lessons_learned)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, input.problemDescription, input.rootCause, input.fix, input.sqlUsed ?? '', input.prevention ?? '', input.lessonsLearned ?? ''],
    );

    return id;
  },

  async saveFlow(flow: FlowPayload) {
    const id = uid('flow');

    if (!isTauriRuntime()) {
      const raw = localStorage.getItem(flowKey);
      const arr = raw ? (JSON.parse(raw) as unknown[]) : [];
      localStorage.setItem(flowKey, JSON.stringify([{ id, flow }, ...arr]));
      return id;
    }

    await initializeDatabase();
    const db = await getDb();
    await db.execute('INSERT INTO process_flows (id, flow_json) VALUES (?, ?)', [id, JSON.stringify(flow)]);
    return id;
  },
};
