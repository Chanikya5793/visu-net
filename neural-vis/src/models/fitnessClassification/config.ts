// src/models/fitnessModel/config.ts
export const fitnessModelConfig = {
  input: {
    heartRateCategories: ["60-75", "76-90", "91-110", "111-130", "131+"],
    bmiCategories: ["Underweight", "Normal", "Overweight", "Obese"],
    staminaCategories: ["Low", "Medium", "High"]
  },
  output: {
    fitnessCategories: ["Fit", "Average", "Unfit"]
  },
  networkArchitecture: [12, 8, 6, 3]
};

// src/models/fitnessModel/data.ts
export const mapHeartRate = (value: string): number => {
  const map: { [key: string]: number } = {
    "60-75": 0.3,
    "76-90": 0.45,
    "91-110": 0.55,
    "111-130": 0.7,
    "131+": 0.85
  };
  return map[value] || 0;
};

export const mapBMI = (value: string): number => {
  const map: { [key: string]: number } = {
    "Underweight": -1,
    "Normal": 0,
    "Overweight": 1,
    "Obese": 2
  };
  return map[value] || 0;
};

export const mapStamina = (value: string): number => {
  const map: { [key: string]: number } = {
    "Low": 0,
    "Medium": 0.5,
    "High": 1
  };
  return map[value] || 0;
};

export const fitnessData = {
  training: [] // Add your training data here
};