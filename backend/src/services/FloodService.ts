import axios from 'axios';

export class FloodService {
  /**
   * Calculates flood risk by combining current precipitation with 7-day historical accumulation.
   */
  static async getFloodRisk(lat: number, lon: number, currentPrecip: number): Promise<{ level: string, score: number }> {
    try {
      // Fetch last 7 days of precipitation to check for ground saturation
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const response = await axios.get(
        `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDate}&daily=precipitation_sum`
      );

      const historicalPrecip = response.data.daily.precipitation_sum.reduce((a: number, b: number) => a + (b || 0), 0);

      // Heuristic: Current rain + 20% of last week's rain
      let score = (currentPrecip * 3) + (historicalPrecip * 0.5);

      // Add a factor for "urban flooding" if score is already moderate
      if (score > 30) score += 10;

      score = Math.min(100, score);

      let level = "Minimal";
      if (score > 80) level = "Extreme";
      else if (score > 60) level = "High";
      else if (score > 40) level = "Moderate";
      else if (score > 20) level = "Low";

      return { level, score: Math.round(score) };
    } catch (error) {
      console.warn("Flood data fetch failed, using simplified logic");
      let score = Math.min(100, (currentPrecip || 0) * 5);
      let level = score > 50 ? "Moderate" : "Low";
      return { level, score };
    }
  }
}
