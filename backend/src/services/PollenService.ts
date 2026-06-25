import axios from 'axios';

export class PollenService {
  /**
   * Fetches pollen data from Open-Meteo.
   * Open-Meteo provides European and American pollen data.
   */
  static async getPollenData(lat: number, lon: number): Promise<{ tree: number, grass: number, weed: number }> {
    try {
      // Open-Meteo Air Quality API includes pollen forecasts
      const response = await axios.get(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen`
      );

      const current = response.data.current;

      // Open-Meteo returns grains/m3. We map this to a 0-5 scale.
      // Scaling is approximate: High birch is > 80, grass > 50, etc.

      const tree = Math.min(5, ((current.alder_pollen || 0) + (current.birch_pollen || 0) + (current.olive_pollen || 0)) / 40);
      const grass = Math.min(5, (current.grass_pollen || 0) / 20);
      const weed = Math.min(5, ((current.mugwort_pollen || 0) + (current.ragweed_pollen || 0)) / 20);

      return {
        tree: Math.round(tree),
        grass: Math.round(grass),
        weed: Math.round(weed)
      };
    } catch (error) {
      console.warn("Pollen API failed, using season-based simulation");
      return this.getSimulatedPollen();
    }
  }

  private static getSimulatedPollen() {
    const month = new Date().getMonth();
    let tree = 1, grass = 1, weed = 1;
    if (month >= 2 && month <= 4) tree = 4;
    if (month >= 5 && month <= 7) grass = 4;
    if (month >= 8 && month <= 10) weed = 4;
    return {
      tree: Math.min(5, tree + Math.floor(Math.random() * 2)),
      grass: Math.min(5, grass + Math.floor(Math.random() * 2)),
      weed: Math.min(5, weed + Math.floor(Math.random() * 2))
    };
  }
}
