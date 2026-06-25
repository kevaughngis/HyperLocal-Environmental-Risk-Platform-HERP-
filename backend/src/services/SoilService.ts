export class SoilService {
  static async getSoilData(lat: number, lon: number, temp: number): Promise<{ moisture: number, temperature: number }> {
    // Soil temp is usually slightly cooler or warmer than air temp depending on moisture
    return {
      moisture: 30 + Math.random() * 40,
      temperature: temp - 2 + Math.random() * 4
    };
  }
}
