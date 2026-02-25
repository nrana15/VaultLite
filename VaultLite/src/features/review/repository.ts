import { getDb } from '../../database/client';
import { initializeDatabase } from '../../database/migrate';
import { scheduleSm2, type ReviewRating } from '../../services/sm2';
import type { Flashcard, VaultItem } from '../../types/domain';

interface FlashcardRow {
  id: string;
  item_id: string;
  card_type: Flashcard['type'];
  question: string;
  answer: string;
  difficulty: number;
  next_review_date: string;
  review_interval: number;
  ease_factor: number;
  repetition_count: number;
}

function uid(prefix = 'card'): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function isTauriRuntime() {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

function mapFlashcardRow(row: FlashcardRow): Flashcard {
  return {
    id: row.id,
    itemId: row.item_id,
    type: row.card_type,
    question: row.question,
    answer: row.answer,
    difficulty: row.difficulty,
    nextReviewDate: row.next_review_date,
    reviewInterval: row.review_interval,
    easeFactor: row.ease_factor,
    repetitionCount: row.repetition_count,
  };
}

const browserCardsKey = 'vaultlite.flashcards';

function readBrowserCards(): Flashcard[] {
  const raw = localStorage.getItem(browserCardsKey);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Flashcard[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeBrowserCards(cards: Flashcard[]) {
  localStorage.setItem(browserCardsKey, JSON.stringify(cards));
}

export const reviewRepository = {
  async getDashboardStats() {
    if (!isTauriRuntime()) {
      const cards = readBrowserCards();
      const now = new Date();
      const due = cards.filter((c) => new Date(c.nextReviewDate) <= now).length;
      return { dueToday: due, overdue: 0, upcoming: Math.max(cards.length - due, 0), mastery: 0 };
    }

    await initializeDatabase();
    const db = await getDb();
    const [due] = await db.select<{ count: number }[]>(
      "SELECT COUNT(*) as count FROM flashcards WHERE date(next_review_date) <= date('now')",
    );
    const [overdue] = await db.select<{ count: number }[]>(
      "SELECT COUNT(*) as count FROM flashcards WHERE date(next_review_date) < date('now')",
    );
    const [upcoming] = await db.select<{ count: number }[]>(
      "SELECT COUNT(*) as count FROM flashcards WHERE date(next_review_date) > date('now')",
    );

    const [masteryRaw] = await db.select<{ mastery: number }[]>(
      'SELECT COALESCE(AVG(CASE WHEN repetition_count >= 3 THEN 100 ELSE repetition_count * 25 END), 0) as mastery FROM flashcards',
    );

    return {
      dueToday: due?.count ?? 0,
      overdue: overdue?.count ?? 0,
      upcoming: upcoming?.count ?? 0,
      mastery: Math.round(masteryRaw?.mastery ?? 0),
    };
  },

  async getDueCards(): Promise<Flashcard[]> {
    if (!isTauriRuntime()) {
      const now = new Date();
      return readBrowserCards().filter((c) => new Date(c.nextReviewDate) <= now);
    }

    await initializeDatabase();
    const db = await getDb();
    const rows = await db.select<FlashcardRow[]>(
      "SELECT * FROM flashcards WHERE date(next_review_date) <= date('now') ORDER BY next_review_date ASC LIMIT 100",
    );
    return rows.map(mapFlashcardRow);
  },

  async generateFromItem(item: VaultItem): Promise<Flashcard[]> {
    const generated = [
      {
        id: uid(),
        itemId: item.id,
        type: 'basic_qa' as const,
        question: `Explain: ${item.title}`,
        answer: item.content,
        difficulty: 2,
        nextReviewDate: new Date().toISOString(),
        reviewInterval: 1,
        easeFactor: 2.5,
        repetitionCount: 0,
      },
    ];

    if (!isTauriRuntime()) {
      const current = readBrowserCards();
      writeBrowserCards([...generated, ...current]);
      return generated;
    }

    await initializeDatabase();
    const db = await getDb();

    for (const card of generated) {
      await db.execute(
        `INSERT INTO flashcards (id, item_id, card_type, question, answer, difficulty, next_review_date, review_interval, ease_factor, repetition_count)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          card.id,
          card.itemId,
          card.type,
          card.question,
          card.answer,
          card.difficulty,
          card.nextReviewDate,
          card.reviewInterval,
          card.easeFactor,
          card.repetitionCount,
        ],
      );
    }

    return generated;
  },

  async rateCard(card: Flashcard, rating: ReviewRating) {
    const next = scheduleSm2(
      {
        repetitionCount: card.repetitionCount,
        reviewInterval: card.reviewInterval,
        easeFactor: card.easeFactor,
      },
      rating,
    );

    if (!isTauriRuntime()) {
      const cards = readBrowserCards().map((c) =>
        c.id === card.id
          ? {
              ...c,
              repetitionCount: next.repetitionCount,
              reviewInterval: next.reviewInterval,
              easeFactor: next.easeFactor,
              nextReviewDate: next.nextReviewDate,
            }
          : c,
      );
      writeBrowserCards(cards);
      return;
    }

    await initializeDatabase();
    const db = await getDb();

    await db.execute(
      `UPDATE flashcards
       SET repetition_count = ?, review_interval = ?, ease_factor = ?, next_review_date = ?, updated_at = ?
       WHERE id = ?`,
      [
        next.repetitionCount,
        next.reviewInterval,
        next.easeFactor,
        next.nextReviewDate,
        new Date().toISOString(),
        card.id,
      ],
    );

    await db.execute('INSERT INTO review_events (id, flashcard_id, rating) VALUES (?, ?, ?)', [uid('evt'), card.id, rating]);
  },
};
