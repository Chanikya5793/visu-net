export interface WeatherData {
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
}

// Normalize data to 0-1 range
export function normalizeData(data: WeatherData) {
  return {
    input: [
      data.temperature / 50,  // Assuming range -20 to 50°C
      data.humidity / 100,    // Humidity is already 0-100%
      data.pressure / 1100,   // Typical range 900-1100 hPa
      data.windSpeed / 100    // Wind speed 0-100 km/h
    ],
    output: [0] // Will be set based on prediction (e.g., 1 for rain, 0 for no rain)
  };
}

// Sample training data
export const weatherData = {
  training: [
    // Example data points
    { input: [0.6, 0.85, 0.95, 0.15], output: [1] },  // Rain
    { input: [0.7, 0.45, 0.98, 0.08], output: [0] },  // No Rain
    // Add more training data here from your dataset
  ]
};