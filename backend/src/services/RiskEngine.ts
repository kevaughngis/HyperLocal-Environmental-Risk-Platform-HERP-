import type { EnvironmentalData } from '../types/index.js';

export class RiskEngine {
  static calculateScore(data: Partial<EnvironmentalData>): number {
    let score = 0;

    // Air Quality (Max 30 points)
    if (data.airQuality) {
      if (data.airQuality.aqi > 200) score += 30;
      else if (data.airQuality.aqi > 150) score += 25;
      else if (data.airQuality.aqi > 100) score += 15;
      else if (data.airQuality.aqi > 50) score += 5;
    }

    // UV Index (Max 15 points)
    if (data.uvIndex) {
      if (data.uvIndex > 10) score += 15;
      else if (data.uvIndex > 7) score += 10;
      else if (data.uvIndex > 4) score += 5;
    }

    // Weather extremes (Max 15 points)
    if (data.weather) {
      if (data.weather.temp > 40 || data.weather.temp < -20) score += 15;
      else if (data.weather.temp > 35 || data.weather.temp < -10) score += 10;
      if (data.weather.windSpeed > 60) score += 15;
    }

    // Flood Risk (Max 20 points)
    if (data.floodRisk) {
      if (data.floodRisk.score > 80) score += 20;
      else if (data.floodRisk.score > 50) score += 10;
    }

    // Pollen (Max 10 points)
    if (data.pollen) {
      const maxPollen = Math.max(data.pollen.tree, data.pollen.grass, data.pollen.weed);
      if (maxPollen >= 5) score += 10;
      else if (maxPollen >= 3) score += 5;
    }

    // Soil/Drought (Max 10 points)
    if (data.soil) {
      if (data.soil.moisture < 15) score += 10; // Drought risk
    }

    return Math.min(100, score);
  }

  static generateRecommendations(data: Partial<EnvironmentalData>, score: number): string[] {
    const recs: string[] = [];

    if (score < 20) {
      recs.push("Conditions are generally safe for outdoor activities.");
    }

    if (data.airQuality && data.airQuality.aqi > 100) {
      recs.push("High air pollution detected. Sensitive groups should reduce outdoor exercise.");
    }

    if (data.uvIndex && data.uvIndex > 6) {
      recs.push("High UV radiation. Apply sunscreen and wear protective clothing.");
    }

    if (data.weather && data.weather.temp > 30) {
      recs.push("High temperatures. Stay hydrated and seek shade.");
    }

    if (data.floodRisk && data.floodRisk.score > 50) {
      recs.push("Flood warning in effect. Avoid low-lying areas and follow local advisories.");
    }

    if (data.pollen) {
      const maxPollen = Math.max(data.pollen.tree, data.pollen.grass, data.pollen.weed);
      if (maxPollen >= 4) {
        recs.push("High pollen count. Consider taking allergy medication if sensitive.");
      }
    }

    if (data.soil && data.soil.moisture < 20) {
      recs.push("Very dry soil conditions. Follow municipal water restrictions and dust suppression guidelines.");
    }

    if (data.weather && data.weather.windSpeed > 50) {
      recs.push("High wind warning. Secure loose outdoor objects.");
    }

    return recs;
  }
}
