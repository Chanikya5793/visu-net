import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StateCreator } from 'zustand';

interface SettingsState {
  darkMode: boolean;
  animationSpeed: number;
  nodeSize: number;
  showLabels: boolean;
  setDarkMode: (darkMode: boolean) => void;
  setAnimationSpeed: (speed: number) => void;
  setNodeSize: (size: number) => void;
  setShowLabels: (show: boolean) => void;
  resetToDefaults: () => void;
}

const defaultSettings = {
  darkMode: false,
  animationSpeed: 1,
  nodeSize: 30,
  showLabels: true,
};

type SettingsStateCreator = StateCreator<
  SettingsState,
  [],
  [],
  SettingsState
>;

export const useSettingsStore = create<SettingsState>()(
  persist(
    ((set) => ({
      ...defaultSettings,
      setDarkMode: (darkMode: boolean) => set({ darkMode }),
      setAnimationSpeed: (animationSpeed: number) => set({ animationSpeed }),
      setNodeSize: (nodeSize: number) => set({ nodeSize }),
      setShowLabels: (showLabels: boolean) => set({ showLabels }),
      resetToDefaults: () => set(defaultSettings),
    })) as SettingsStateCreator,
    {
      name: 'settings-storage',
    }
  )
);
