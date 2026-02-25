import { create } from 'zustand';
import { analyticsRepository, type AnalyticsSnapshot } from '../features/analytics/repository';

interface AnalyticsState {
  snapshot: AnalyticsSnapshot;
  loading: boolean;
  load: () => Promise<void>;
}

const emptySnapshot: AnalyticsSnapshot = {
  totalConcepts: 0,
  retentionRate: 0,
  reviewStreak: 0,
  difficultTopics: [],
  heatmap: [],
};

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  snapshot: emptySnapshot,
  loading: false,
  load: async () => {
    set({ loading: true });
    const snapshot = await analyticsRepository.getSnapshot();
    set({ snapshot, loading: false });
  },
}));
