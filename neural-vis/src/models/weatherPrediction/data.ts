import weatherPredictionJson from './weatherPrediction.json';

interface WeatherData {
  "Temperature (°C)": string;
  "Humidity (%)": string;
  "Cloud Cover (%)": string;
  "Expected Output (Rain Probability)": string;
}

interface TrainingData {
    input: number[];
    output: number[];
}

export const weatherData = {
    training: weatherPredictionJson.map((entry: WeatherData) => {
        const temperature = parseFloat(entry["Temperature (°C)"]) / 50; // Normalize assuming range -20 to 50°C
        const humidity = parseFloat(entry["Humidity (%)"]) / 100; // 0-1
        const cloudCover = parseFloat(entry["Cloud Cover (%)"]) / 100; // 0-1
        const rainProb = parseFloat(entry["Expected Output (Rain Probability)"].replace('%', '')) / 100; // 0-1

        return {
            input: [temperature, humidity, cloudCover],
            output: [rainProb]
        };
    })
};