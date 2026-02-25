import { getDb } from '../../database/client';
import { initializeDatabase } from '../../database/migrate';

function isTauriRuntime() {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

export interface AnalyticsSnapshot {
  totalConcepts: number;
  retentionRate: number;
  reviewStreak: number;
  difficultTopics: Array<{ title: string; misses: number }>;
  heatmap: Array<{ day: string; count: number }>;
}

export const analyticsRepository = {
  async getSnapshot(): Promise<AnalyticsSnapshot> {
    if (!isTauriRuntime()) {
      return {
        totalConcepts: 0,
        retentionRate: 0,
        reviewStreak: 0,
        difficultTopics: [],
        heatmap: [],
      };
    }

    await initializeDatabase();
    const db = await getDb();

    const [concepts] = await db.select<{ count: number }[]>(
      "SELECT COUNT(*) as count FROM vault_items WHERE knowledge_type = 'Concept'",
    );

    const [retention] = await db.select<{ rate: number }[]>(
      `SELECT COALESCE(AVG(CASE WHEN rating >= 2 THEN 1.0 ELSE 0.0 END) * 100, 0) as rate FROM review_events`,
    );

    const streakRows = await db.select<{ day: string }[]>(
      `SELECT DISTINCT date(reviewed_at) as day
       FROM review_events
       ORDER BY day DESC
       LIMIT 30`,
    );

    const difficultTopics = await db.select<{ title: string; misses: number }[]>(
      `SELECT v.title, COUNT(*) as misses
       FROM review_events r
       JOIN flashcards f ON f.id = r.flashcard_id
       JOIN vault_items v ON v.id = f.item_id
       WHERE r.rating = 0
       GROUP BY v.id
       ORDER BY misses DESC
       LIMIT 5`,
    );

    const heatmap = await db.select<{ day: string; count: number }[]>(
      `SELECT date(reviewed_at) as day, COUNT(*) as count
       FROM review_events
       GROUP BY date(reviewed_at)
       ORDER BY day DESC
       LIMIT 60`,
    );

    let reviewStreak = 0;
    const expected = new Date();
    for (const row of streakRows) {
      const day = new Date(`${row.day}T00:00:00`);
      const expectedDay = new Date(expected);
      expectedDay.setHours(0, 0, 0, 0);
      if (day.toDateString() === expectedDay.toDateString()) {
        reviewStreak += 1;
        expected.setDate(expected.getDate() - 1);
      } else {
        break;
      }
    }

    return {
      totalConcepts: concepts?.count ?? 0,
      retentionRate: Math.round(retention?.rate ?? 0),
      reviewStreak,
      difficultTopics,
      heatmap,
    };
  },
};
