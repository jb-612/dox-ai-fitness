import { create } from "zustand";

interface AppState {
  isLoaded: boolean;
  setLoaded: (loaded: boolean) => void;
  activeCharacter: string | null;
  setActiveCharacter: (id: string | null) => void;
}

export const useStore = create<AppState>((set) => ({
  isLoaded: false,
  setLoaded: (loaded) => set({ isLoaded: loaded }),
  activeCharacter: null,
  setActiveCharacter: (id) => set({ activeCharacter: id }),
}));
