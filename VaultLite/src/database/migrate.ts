import { getDb } from './client';
import schemaSql from './schema.sql?raw';
import seedSql from './seed.sql?raw';

let initialized = false;

export async function initializeDatabase() {
  if (initialized) return;

  const db = await getDb();
  await db.execute(schemaSql);

  const rows = await db.select<{ count: number }[]>('SELECT COUNT(*) as count FROM folders');
  const count = rows[0]?.count ?? 0;
  if (count === 0) {
    await db.execute(seedSql);
  }

  initialized = true;
}
