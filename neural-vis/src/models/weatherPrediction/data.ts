import weatherPredictionJson from './weatherPrediction.json';

interface WeatherData {
  "Temperature (°C)": string;
  "Humidity (%)": string;
  "Cloud Cover (%)": string;
  "Expected Output (Rain Probability)": string;
}

interface TrainingData {
    input: number[]; // [temp<20, temp20-30, temp30-40, temp40+, humidity<70, humidity70-85, humidity85+, cloudCover<40, cloudCover40-70, cloudCover70+]
    output: number[]; // [rainProb<30, rainProb30-60, rainProb60-90, rainProb90+]
}

function mapTemperature(temp: number): number[] {
    return [
        temp < 20 ? 1 : 0,
        temp >= 20 && temp < 30 ? 1 : 0,
        temp >= 30 && temp < 40 ? 1 : 0,
        temp >= 40 ? 1 : 0
    ];
}

function mapHumidity(humidity: number): number[] {
    return [
        humidity < 70 ? 1 : 0,
        humidity >= 70 && humidity < 85 ? 1 : 0,
        humidity >= 85 ? 1 : 0
    ];
}

function mapCloudCover(cover: number): number[] {
    return [
        cover < 40 ? 1 : 0,
        cover >= 40 && cover < 70 ? 1 : 0,
        cover >= 70 ? 1 : 0
    ];
}

function mapRainProbability(prob: number): number[] {
    return [
        prob < 30 ? 1 : 0,
        prob >= 30 && prob < 60 ? 1 : 0,
        prob >= 60 && prob < 90 ? 1 : 0,
        prob >= 90 ? 1 : 0
    ];
}

export const weatherData = {
    training: weatherPredictionJson.map((entry: any) => {
        const temp = parseInt(entry["Temperature (°C)"], 10);
        const humidity = parseInt(entry["Humidity (%)"], 10);
        const cloudCover = parseInt(entry["Cloud Cover (%)"], 10);
        const rainProb = parseInt(entry["Expected Output (Rain Probability)"].replace('%', ''), 10);

        return {
            input: [...mapTemperature(temp), ...mapHumidity(humidity), ...mapCloudCover(cloudCover)],
            output: mapRainProbability(rainProb)
        };
    })
};