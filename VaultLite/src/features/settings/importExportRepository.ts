import JSZip from 'jszip';
import { getDb } from '../../database/client';
import { initializeDatabase } from '../../database/migrate';

function isTauriRuntime() {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

async function dumpTable<T>(table: string): Promise<T[]> {
  const db = await getDb();
  return db.select<T[]>(`SELECT * FROM ${table}`);
}

export async function exportVaultBundle(): Promise<Blob> {
  const zip = new JSZip();

  if (isTauriRuntime()) {
    await initializeDatabase();

    const [vault, flashcards, reviewEvents, analytics, patterns, flows, folders, tags, itemTags] = await Promise.all([
      dumpTable('vault_items'),
      dumpTable('flashcards'),
      dumpTable('review_events'),
      dumpTable('review_events'),
      dumpTable('production_patterns'),
      dumpTable('process_flows'),
      dumpTable('folders'),
      dumpTable('tags'),
      dumpTable('item_tags'),
    ]);

    zip.file('vault.json', JSON.stringify(vault, null, 2));
    zip.file('flashcards.json', JSON.stringify(flashcards, null, 2));
    zip.file('review_events.json', JSON.stringify(reviewEvents, null, 2));
    zip.file('analytics.json', JSON.stringify({ events: analytics }, null, 2));
    zip.file('production_patterns.json', JSON.stringify(patterns, null, 2));
    zip.file('process_flows.json', JSON.stringify(flows, null, 2));
    zip.file('folders.json', JSON.stringify(folders, null, 2));
    zip.file('tags.json', JSON.stringify(tags, null, 2));
    zip.file('item_tags.json', JSON.stringify(itemTags, null, 2));
  } else {
    const local = {
      vault: JSON.parse(localStorage.getItem('vaultlite.vault-items') ?? '[]'),
      flashcards: JSON.parse(localStorage.getItem('vaultlite.flashcards') ?? '[]'),
      patterns: JSON.parse(localStorage.getItem('vaultlite.production-patterns') ?? '[]'),
      flows: JSON.parse(localStorage.getItem('vaultlite.process-flows') ?? '[]'),
    };

    zip.file('vault.json', JSON.stringify(local.vault, null, 2));
    zip.file('flashcards.json', JSON.stringify(local.flashcards, null, 2));
    zip.file('production_patterns.json', JSON.stringify(local.patterns, null, 2));
    zip.file('process_flows.json', JSON.stringify(local.flows, null, 2));
    zip.file('analytics.json', JSON.stringify({}, null, 2));
    zip.file('attachments/README.txt', 'Place binary attachments here during desktop export.');
  }

  return zip.generateAsync({ type: 'blob' });
}

export async function importVaultBundle(file: File): Promise<void> {
  const zip = await JSZip.loadAsync(file);

  const getJson = async <T>(name: string, fallback: T): Promise<T> => {
    const entry = zip.file(name);
    if (!entry) return fallback;
    const txt = await entry.async('text');
    return JSON.parse(txt) as T;
  };

  const [vault, flashcards, reviewEvents, patterns, flows, folders, tags, itemTags] = await Promise.all([
    getJson<any[]>('vault.json', []),
    getJson<any[]>('flashcards.json', []),
    getJson<any[]>('review_events.json', []),
    getJson<any[]>('production_patterns.json', []),
    getJson<any[]>('process_flows.json', []),
    getJson<any[]>('folders.json', []),
    getJson<any[]>('tags.json', []),
    getJson<any[]>('item_tags.json', []),
  ]);

  if (!isTauriRuntime()) {
    localStorage.setItem('vaultlite.vault-items', JSON.stringify(vault));
    localStorage.setItem('vaultlite.flashcards', JSON.stringify(flashcards));
    localStorage.setItem('vaultlite.production-patterns', JSON.stringify(patterns));
    localStorage.setItem('vaultlite.process-flows', JSON.stringify(flows));
    return;
  }

  await initializeDatabase();
  const db = await getDb();

  const restore = async (table: string, rows: any[]) => {
    if (!rows.length) return;
    await db.execute(`DELETE FROM ${table}`);
    for (const row of rows) {
      const keys = Object.keys(row);
      const cols = keys.join(', ');
      const marks = keys.map(() => '?').join(', ');
      await db.execute(`INSERT INTO ${table} (${cols}) VALUES (${marks})`, keys.map((k) => row[k]));
    }
  };

  await restore('folders', folders);
  await restore('vault_items', vault);
  await restore('tags', tags);
  await restore('item_tags', itemTags);
  await restore('flashcards', flashcards);
  await restore('review_events', reviewEvents);
  await restore('production_patterns', patterns);
  await restore('process_flows', flows);

  // Rebuild FTS index after restore.
  await db.execute('DELETE FROM vault_fts');
  await db.execute(`
    INSERT INTO vault_fts (item_id, title, content, tags, knowledge_type)
    SELECT
      v.id,
      v.title,
      v.content,
      COALESCE((
        SELECT GROUP_CONCAT(t.name, ' ')
        FROM item_tags it
        JOIN tags t ON t.id = it.tag_id
        WHERE it.item_id = v.id
      ), ''),
      v.knowledge_type
    FROM vault_items v
  `);

  // Recalculate next review date if missing/corrupt.
  await db.execute(`
    UPDATE flashcards
    SET next_review_date = datetime('now', '+' || CASE WHEN review_interval < 1 THEN 1 ELSE review_interval END || ' day')
    WHERE next_review_date IS NULL OR next_review_date = ''
  `);
}
