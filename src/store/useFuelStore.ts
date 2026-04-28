import { create } from 'zustand';
import type { FuelEntry } from '../types/finance';
import { loadFuelEntries, addFuelEntry as dbAddFuelEntry, deleteFuelEntry as dbDeleteFuelEntry } from '../lib/db';
import { useAuthStore } from './useAuthStore';

interface FuelState {
  entries: FuelEntry[];
  isLoading: boolean;
  loadEntries: (userId: string) => Promise<void>;
  addEntry: (entry: FuelEntry) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
}

export const useFuelStore = create<FuelState>()((set) => ({
  entries: [],
  isLoading: false,

  loadEntries: async (userId: string) => {
    set({ isLoading: true });
    try {
      const entries = await loadFuelEntries(userId);
      set({ entries, isLoading: false });
    } catch (error) {
      console.error('Error loading fuel entries:', error);
      set({ isLoading: false });
    }
  },

  addEntry: async (entry: FuelEntry) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    set((state) => ({ entries: [entry, ...state.entries] }));
    try { await dbAddFuelEntry(user.id, entry); }
    catch (e) { console.error('addFuelEntry DB error:', e); }
  },

  deleteEntry: async (id: string) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    set((state) => ({ entries: state.entries.filter((e) => e.id !== id) }));
    try { await dbDeleteFuelEntry(user.id, id); }
    catch (e) { console.error('deleteFuelEntry DB error:', e); }
  },
}));
