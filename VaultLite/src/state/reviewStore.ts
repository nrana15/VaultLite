import { create } from 'zustand';
import { reviewRepository } from '../features/review/repository';
import type { Flashcard } from '../types/domain';
import type { ReviewRating } from '../services/sm2';

interface ReviewStats {
  dueToday: number;
  overdue: number;
  upcoming: number;
  mastery: number;
}

interface ReviewState {
  stats: ReviewStats;
  dueCards: Flashcard[];
  loading: boolean;
  active: boolean;
  showAnswer: boolean;
  load: () => Promise<void>;
  start: () => Promise<void>;
  reveal: () => void;
  rate: (rating: ReviewRating) => Promise<void>;
  close: () => void;
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  stats: { dueToday: 0, overdue: 0, upcoming: 0, mastery: 0 },
  dueCards: [],
  loading: false,
  active: false,
  showAnswer: false,

  load: async () => {
    set({ loading: true });
    const [stats, dueCards] = await Promise.all([reviewRepository.getDashboardStats(), reviewRepository.getDueCards()]);
    set({ stats, dueCards, loading: false });
  },

  start: async () => {
    await get().load();
    set({ active: true, showAnswer: false });
  },

  reveal: () => set({ showAnswer: true }),

  rate: async (rating) => {
    const current = get().dueCards[0];
    if (!current) return;
    await reviewRepository.rateCard(current, rating);
    const remaining = get().dueCards.slice(1);
    const stats = await reviewRepository.getDashboardStats();
    set({ dueCards: remaining, showAnswer: false, stats, active: remaining.length > 0 });
  },

  close: () => set({ active: false, showAnswer: false }),
}));
