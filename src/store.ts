import { create } from "zustand";

export type QualityPreset = "low" | "medium" | "high";

interface AppState {
  isLoaded: boolean;
  setLoaded: (loaded: boolean) => void;
  activeCharacter: string | null;
  setActiveCharacter: (id: string | null) => void;
  quality: QualityPreset;
  setQuality: (quality: QualityPreset) => void;
  muted: boolean;
  setMuted: (muted: boolean) => void;
  cameraTarget: [number, number, number] | null;
  setCameraTarget: (target: [number, number, number] | null) => void;
}

export const useStore = create<AppState>((set) => ({
  isLoaded: false,
  setLoaded: (loaded) => set({ isLoaded: loaded }),
  activeCharacter: null,
  setActiveCharacter: (id) => set({ activeCharacter: id }),
  quality: "high",
  setQuality: (quality) => set({ quality }),
  muted: false,
  setMuted: (muted) => set({ muted }),
  cameraTarget: null,
  setCameraTarget: (target) => set({ cameraTarget: target }),
}));
