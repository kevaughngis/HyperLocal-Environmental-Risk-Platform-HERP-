import { WeatherService } from './WeatherService.js';
import { PollenService } from './PollenService.js';
import { FloodService } from './FloodService.js';
import { SoilService } from './SoilService.js';
import { WildfireService } from './WildfireService.js';
import { SatelliteService } from './SatelliteService.js';
import { RiskEngine } from './RiskEngine.js';

export class ForecastingService {
  /**
   * Generates a 24-hour risk trajectory.
   */
  static async get24hForecast(lat: number, lon: number) {
    const trajectory = [];

    // In a real state-of-the-art app, we would fetch forecast data for each hour
    // For now, we simulate based on the current base risk
    const weatherData = await WeatherService.getEnvironmentalData(lat, lon);
    const pollenData = await PollenService.getPollenData(lat, lon);
    const floodData = await FloodService.getFloodRisk(lat, lon, weatherData.weather?.precipitation || 0);
    const soilData = await SoilService.getSoilData(lat, lon);
    const wildfireData = await WildfireService.getWildfireSmoke(lat, lon);

    const combinedData = {
      ...weatherData,
      pollen: pollenData,
      floodRisk: floodData,
      soil: soilData,
      wildfire: wildfireData
    };

    const baseScore = RiskEngine.calculateScore(combinedData);

    for (let i = 0; i < 24; i++) {
      // Simulate trajectory based on current trends and diurnal patterns
      const hour = (new Date().getHours() + i) % 24;
      const diurnalShift = (hour > 10 && hour < 18) ? 1.2 : 0.8; // Higher risk during day

      trajectory.push({
        hour: i,
        time: new Date(Date.now() + i * 3600000).toISOString(),
        predictedRisk: Math.min(100, baseScore * diurnalShift + (Math.random() - 0.5) * 5),
        confidence: 0.9 - (i * 0.02) // Confidence drops over time
      });
    }

    return trajectory;
  }
}
