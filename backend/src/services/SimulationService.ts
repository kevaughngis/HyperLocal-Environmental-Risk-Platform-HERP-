import { RiskEngine } from './RiskEngine.js';
import { EmergencyService } from './EmergencyService.js';
import type { EnvironmentalData } from '../types/index.js';

export interface SimulationScenario {
  tempOffset?: number;
  precipitationOffset?: number;
  aqiOffset?: number;
  windSpeedOffset?: number;
  humidityOffset?: number;
}

export class SimulationService {
  static async runScenario(lat: number, lon: number, scenario: SimulationScenario) {
    // 1. Get current baseline data (simplified for simulation)
    const baseline: Partial<EnvironmentalData> = {
      weather: {
        temp: 20 + (scenario.tempOffset || 0),
        humidity: 50 + (scenario.humidityOffset || 0),
        windSpeed: 10 + (scenario.windSpeedOffset || 0),
        precipitation: 0 + (scenario.precipitationOffset || 0),
        condition: 'Clear'
      },
      airQuality: {
        aqi: 50 + (scenario.aqiOffset || 0),
        pm25: 12,
        pm10: 20
      },
      floodRisk: {
        score: Math.min(100, (scenario.precipitationOffset || 0) * 0.8),
        level: 'Low'
      },
      soil: {
        moisture: 40,
        temperature: 18
      }
    };

    // 2. Calculate Simulated Risk
    const simulatedScore = RiskEngine.calculateScore(baseline);
    const recommendations = RiskEngine.generateRecommendations(baseline, simulatedScore);

    // 3. Assess impact on evacuation routes
    const routes = await EmergencyService.getSafeRoutes(lat, lon);
    const impactedRoutes = routes.map(route => {
      if (simulatedScore > 80) {
        return { ...route, status: 'Blocked', reason: 'SIMULATION: Extreme Hazard Level' };
      }
      if (simulatedScore > 50 && route.status === 'Clear') {
        return { ...route, status: 'Congested', reason: 'SIMULATION: High Hazard Warning' };
      }
      return route;
    });

    return {
      scenario,
      results: {
        score: simulatedScore,
        recommendations,
        routes: impactedRoutes
      },
      timestamp: new Date().toISOString()
    };
  }
}
