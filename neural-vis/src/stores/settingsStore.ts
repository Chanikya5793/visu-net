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

// Detailed descriptions for each setting
export const settingDescriptions = {
  darkMode: "Toggle between light and dark color themes for better visibility in different environments.",
  showLabels: "Display labels for neurons and layers to better understand the network structure.",
  neuronRadius: "Control the size of neurons in the visualization. Larger values make neurons more prominent.",
  layerSpacing: "Adjust the horizontal distance between network layers. Affects overall network width.",
  verticalSpacing: "Set the vertical gap between neurons in each layer. Impacts network height.",
  connectionOpacity: "Control the visibility of connections between neurons. Higher values make connections more visible.",
  showActivationValues: "Display current activation values for each neuron during network operation.",
  showWeightValues: "Show connection weights between neurons for detailed network analysis.",
  animationSpeed: "Adjust the speed of training and propagation animations.",
  batchSize: "Number of samples processed together during training. Larger batches provide more stable updates but require more memory. Range: 1-512.",
  epochs: "Total number of complete passes through the training dataset. More epochs allow for better learning but may lead to overfitting. Range: 1-1000.",
  validationSplit: "Portion of data reserved for validation (10-50%). Used to monitor model performance on unseen data and prevent overfitting.",
  earlyStoppingPatience: "Number of epochs to wait before stopping training if validation performance doesn't improve. Helps prevent overfitting. Range: 1-50."
};

const defaultSettings = {
  darkMode: false,
  showLabels: true,
  neuronRadius: 12,
  layerSpacing: 250,
  verticalSpacing: 50,
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
