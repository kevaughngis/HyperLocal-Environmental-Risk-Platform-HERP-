export interface EnvironmentalData {
  location: {
    lat: number;
    lon: number;
    name?: string;
  };
  weather: {
    temp: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    precipitation?: number;
  };
  airQuality: {
    aqi: number;
    pm25: number;
    pm10: number;
  };
  uvIndex: number;
  pollen: {
    tree: number; // 0-5
    grass: number;
    weed: number;
  };
  floodRisk: {
    level: string; // "Minimal", "Low", "Moderate", "High", "Extreme"
    score: number; // 0-100
  };
  soil: {
    moisture: number; // percentage
    temperature: number;
  };
  wildfire: {
    status: string;
    plumesDetected: number;
    visibility: string;
    details: string;
  };
  compliance: {
    status: string;
    reminders: string[];
  };
  riskScore: number;
  recommendations: string[];
}
