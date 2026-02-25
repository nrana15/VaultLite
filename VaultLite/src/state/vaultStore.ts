import { create } from 'zustand';
import { vaultRepository, type VaultCreateInput } from '../features/vault/repository';
import type { VaultItem } from '../types/domain';

interface VaultState {
  items: VaultItem[];
  loading: boolean;
  query: string;
  error?: string;
  load: () => Promise<void>;
  createItem: (input: VaultCreateInput) => Promise<void>;
  setQuery: (query: string) => Promise<void>;
}

export const useVaultStore = create<VaultState>((set) => ({
  items: [],
  loading: false,
  query: '',

  load: async () => {
    set({ loading: true, error: undefined });
    try {
      const items = await vaultRepository.list();
      set({ items, loading: false });
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : 'Failed to load vault' });
    }
  },

  createItem: async (input) => {
    set({ loading: true, error: undefined });
    try {
      await vaultRepository.create(input);
      const items = await vaultRepository.list();
      set({ items, loading: false });
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : 'Failed to create item' });
    }
  },

  setQuery: async (query) => {
    set({ query, loading: true, error: undefined });
    try {
      const items = query.trim() ? await vaultRepository.search(query) : await vaultRepository.list();
      set({ items, loading: false });
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : 'Search failed' });
    }
  },
}));
