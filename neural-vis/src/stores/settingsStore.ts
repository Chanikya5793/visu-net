import { create, StateCreator } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  // General Settings
  darkMode: boolean;
  showLabels: boolean;

  // Visualization Settings
  neuronRadius: number;
  layerSpacing: number;
  verticalSpacing: number;
  connectionOpacity: number;
  showActivationValues: boolean;
  showWeightValues: boolean;
  animationSpeed: number;

  // Training Settings
  batchSize: number;
  epochs: number;
  validationSplit: number;
  earlyStoppingPatience: number;

  // Setters
  setDarkMode: (darkMode: boolean) => void;
  setShowLabels: (show: boolean) => void;
  setNeuronRadius: (radius: number) => void;
  setLayerSpacing: (spacing: number) => void;
  setVerticalSpacing: (spacing: number) => void;
  setConnectionOpacity: (opacity: number) => void;
  setShowActivationValues: (show: boolean) => void;
  setShowWeightValues: (show: boolean) => void;
  setAnimationSpeed: (speed: number) => void;
  setBatchSize: (size: number) => void;
  setEpochs: (epochs: number) => void;
  setValidationSplit: (split: number) => void;
  setEarlyStoppingPatience: (patience: number) => void;
  resetToDefaults: () => void;
}

const defaultSettings = {
  darkMode: false,
  showLabels: true,
  neuronRadius: 12,
  layerSpacing: 150,
  verticalSpacing: 40,
  connectionOpacity: 0.5,
  showActivationValues: true,
  showWeightValues: false,
  animationSpeed: 1,
  batchSize: 32,
  epochs: 100,
  validationSplit: 0.2,
  earlyStoppingPatience: 10
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
      setShowLabels: (showLabels: boolean) => set({ showLabels }),
      setNeuronRadius: (neuronRadius: number) => set({ neuronRadius }),
      setLayerSpacing: (layerSpacing: number) => set({ layerSpacing }),
      setVerticalSpacing: (verticalSpacing: number) => set({ verticalSpacing }),
      setConnectionOpacity: (connectionOpacity: number) => set({ connectionOpacity }),
      setShowActivationValues: (showActivationValues: boolean) => set({ showActivationValues }),
      setShowWeightValues: (showWeightValues: boolean) => set({ showWeightValues }),
      setAnimationSpeed: (animationSpeed: number) => set({ animationSpeed }),
      setBatchSize: (batchSize: number) => set({ batchSize }),
      setEpochs: (epochs: number) => set({ epochs }),
      setValidationSplit: (validationSplit: number) => set({ validationSplit }),
      setEarlyStoppingPatience: (earlyStoppingPatience: number) => set({ earlyStoppingPatience }),
      resetToDefaults: () => set(defaultSettings)
    })) as SettingsStateCreator,
    {
      name: 'settings-storage'
    }
  )
);
