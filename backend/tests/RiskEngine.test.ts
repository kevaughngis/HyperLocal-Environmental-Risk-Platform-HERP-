import { RiskEngine } from '../src/services/RiskEngine';

describe('RiskEngine', () => {
  test('should calculate a low score for good conditions', () => {
    const data = {
      airQuality: { aqi: 20 },
      uvIndex: 1,
      weather: { temp: 20, windSpeed: 5 },
      floodRisk: { score: 10 },
      pollen: { tree: 1, grass: 1, weed: 1 },
      soil: { moisture: 40 }
    };
    const score = RiskEngine.calculateScore(data as any);
    expect(score).toBeLessThan(20);
  });

  test('should calculate a high score for poor conditions', () => {
    const data = {
      airQuality: { aqi: 250 }, // +30
      uvIndex: 11, // +15
      weather: { temp: 45, windSpeed: 70 }, // +15 + 15
      floodRisk: { score: 90 }, // +20
      pollen: { tree: 5, grass: 1, weed: 1 }, // +10
      soil: { moisture: 10 } // +10
    };
    const score = RiskEngine.calculateScore(data as any);
    expect(score).toBe(100); // Capped at 100
  });

  test('should generate appropriate recommendations', () => {
    const data = {
      airQuality: { aqi: 150 },
      uvIndex: 8
    };
    const recs = RiskEngine.generateRecommendations(data as any, 50);
    expect(recs).toContain("High air pollution detected. Sensitive groups should reduce outdoor exercise.");
    expect(recs).toContain("High UV radiation. Apply sunscreen and wear protective clothing.");
  });
});
