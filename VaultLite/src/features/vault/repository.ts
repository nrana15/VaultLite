import { buildFtsQuery } from '../../services/search';
import type { KnowledgeType, VaultItem } from '../../types/domain';
import { getDb } from '../../database/client';
import { initializeDatabase } from '../../database/migrate';

const KNOWLEDGE_TYPES: KnowledgeType[] = [
  'Concept',
  'Process',
  'SQL Query',
  'Configuration',
  'Debug Pattern',
  'Architecture',
  'Issue Resolution',
  'Interview Question',
  'Checklist',
  'Production Pattern',
];

export interface VaultCreateInput {
  title: string;
  content: string;
  knowledgeType: KnowledgeType;
  tags: string[];
}

interface VaultRow {
  id: string;
  title: string;
  content: string;
  knowledge_type: KnowledgeType;
  pinned: number;
  archived: number;
  created_at: string;
  updated_at: string;
}

const browserStoreKey = 'vaultlite.vault-items';

function mapRowToItem(row: VaultRow, tags: string[] = []): VaultItem {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    knowledgeType: row.knowledge_type,
    tags,
    pinned: !!row.pinned,
    archived: !!row.archived,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function uid(prefix = 'item'): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function isTauriRuntime() {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

function readBrowserItems(): VaultItem[] {
  const raw = localStorage.getItem(browserStoreKey);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as VaultItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeBrowserItems(items: VaultItem[]) {
  localStorage.setItem(browserStoreKey, JSON.stringify(items));
}

async function loadTagsByItemId(itemIds: string[]) {
  if (!itemIds.length) return new Map<string, string[]>();
  const db = await getDb();
  const rows = await db.select<{ item_id: string; name: string }[]>(
    `SELECT it.item_id, t.name
     FROM item_tags it
     JOIN tags t ON t.id = it.tag_id
     WHERE it.item_id IN (${itemIds.map(() => '?').join(',')})`,
    itemIds,
  );

  const map = new Map<string, string[]>();
  rows.forEach((r) => {
    const curr = map.get(r.item_id) ?? [];
    curr.push(r.name);
    map.set(r.item_id, curr);
  });

  return map;
}

async function ensureTagIds(tags: string[]) {
  const db = await getDb();
  const ids: string[] = [];

  for (const tag of tags) {
    const trimmed = tag.trim();
    if (!trimmed) continue;
    const existing = await db.select<{ id: string }[]>(`SELECT id FROM tags WHERE name = ? LIMIT 1`, [trimmed]);

    if (existing[0]?.id) {
      ids.push(existing[0].id);
      continue;
    }

    const id = uid('tag');
    await db.execute(`INSERT INTO tags (id, name) VALUES (?, ?)`, [id, trimmed]);
    ids.push(id);
  }

  return ids;
}

async function attachTags(itemId: string, tags: string[]) {
  const tagIds = await ensureTagIds(tags);
  const db = await getDb();

  await db.execute('DELETE FROM item_tags WHERE item_id = ?', [itemId]);
  for (const tagId of tagIds) {
    await db.execute('INSERT OR IGNORE INTO item_tags (item_id, tag_id) VALUES (?, ?)', [itemId, tagId]);
  }
}

export const vaultRepository = {
  knowledgeTypes: KNOWLEDGE_TYPES,

  async list(): Promise<VaultItem[]> {
    if (!isTauriRuntime()) {
      return readBrowserItems();
    }

    await initializeDatabase();
    const db = await getDb();
    const rows = await db.select<VaultRow[]>('SELECT * FROM vault_items ORDER BY updated_at DESC');
    const tagMap = await loadTagsByItemId(rows.map((r) => r.id));

    return rows.map((row) => mapRowToItem(row, tagMap.get(row.id) ?? []));
  },

  async create(input: VaultCreateInput): Promise<VaultItem> {
    const now = new Date().toISOString();

    if (!isTauriRuntime()) {
      const items = readBrowserItems();
      const created: VaultItem = {
        id: uid(),
        title: input.title,
        content: input.content,
        knowledgeType: input.knowledgeType,
        tags: input.tags,
        pinned: false,
        archived: false,
        createdAt: now,
        updatedAt: now,
      };
      writeBrowserItems([created, ...items]);
      return created;
    }

    await initializeDatabase();
    const db = await getDb();
    const id = uid();

    await db.execute(
      `INSERT INTO vault_items (id, title, content, knowledge_type, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, input.title, input.content, input.knowledgeType, now, now],
    );

    await attachTags(id, input.tags);

    return {
      id,
      title: input.title,
      content: input.content,
      knowledgeType: input.knowledgeType,
      tags: input.tags,
      pinned: false,
      archived: false,
      createdAt: now,
      updatedAt: now,
    };
  },

  async togglePinned(itemId: string, pinned: boolean): Promise<void> {
    if (!isTauriRuntime()) {
      const items = readBrowserItems().map((item) =>
        item.id === itemId ? { ...item, pinned, updatedAt: new Date().toISOString() } : item,
      );
      writeBrowserItems(items);
      return;
    }

    await initializeDatabase();
    const db = await getDb();
    await db.execute('UPDATE vault_items SET pinned = ?, updated_at = ? WHERE id = ?', [
      pinned ? 1 : 0,
      new Date().toISOString(),
      itemId,
    ]);
  },

  async toggleArchived(itemId: string, archived: boolean): Promise<void> {
    if (!isTauriRuntime()) {
      const items = readBrowserItems().map((item) =>
        item.id === itemId ? { ...item, archived, updatedAt: new Date().toISOString() } : item,
      );
      writeBrowserItems(items);
      return;
    }

    await initializeDatabase();
    const db = await getDb();
    await db.execute('UPDATE vault_items SET archived = ?, updated_at = ? WHERE id = ?', [
      archived ? 1 : 0,
      new Date().toISOString(),
      itemId,
    ]);
  },

  async search(query: string): Promise<VaultItem[]> {
    if (!query.trim()) return this.list();

    if (!isTauriRuntime()) {
      const items = readBrowserItems();
      const q = query.toLowerCase();
      return items.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.content.toLowerCase().includes(q) ||
          item.tags.some((t) => t.toLowerCase().includes(q)) ||
          item.knowledgeType.toLowerCase().includes(q),
      );
    }

    await initializeDatabase();
    const db = await getDb();

    const rows = await db.select<VaultRow[]>(
      `SELECT v.*
       FROM vault_fts f
       JOIN vault_items v ON v.id = f.item_id
       WHERE vault_fts MATCH ?
       ORDER BY bm25(vault_fts), v.updated_at DESC`,
      [buildFtsQuery(query)],
    );

    const tagMap = await loadTagsByItemId(rows.map((r) => r.id));
    return rows.map((row) => mapRowToItem(row, tagMap.get(row.id) ?? []));
  },
};
