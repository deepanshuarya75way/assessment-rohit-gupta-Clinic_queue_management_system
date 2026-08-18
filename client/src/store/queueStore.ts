import { create } from 'zustand';
import { QueueEntry } from '../types';

interface QueueState {
  entries: QueueEntry[];
  current: QueueEntry | null;
  nextPatients: QueueEntry[];
  setEntries: (entries: QueueEntry[]) => void;
  setCurrentAndNext: (current: QueueEntry | null, next: QueueEntry[]) => void;
  updateEntry: (entry: QueueEntry) => void;
  removeEntry: (id: number) => void;
}

export const useQueueStore = create<QueueState>((set) => ({
  entries: [],
  current: null,
  nextPatients: [],

  setEntries: (entries) => set({ entries }),

  setCurrentAndNext: (current, nextPatients) => set({ current, nextPatients }),

  updateEntry: (entry) =>
    set((state) => ({
      entries: state.entries.map((e) => (e.id === entry.id ? entry : e)),
      current: state.current?.id === entry.id ? entry : state.current,
    })),

  removeEntry: (id) =>
    set((state) => ({
      entries: state.entries.filter((e) => e.id !== id),
    })),
}));
