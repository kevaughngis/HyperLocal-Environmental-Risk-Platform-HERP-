import axios from 'axios';

export class SoilService {
  /**
   * Fetches soil data from Open-Meteo
   * @param lat Latitude
   * @param lon Longitude
   */
  static async getSoilData(lat: number, lon: number): Promise<{ moisture: number, temperature: number }> {
    try {
      // Open-Meteo Soil moisture (0-7cm) and Soil temperature (0-7cm)
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=soil_temperature_0_to_7cm,soil_moisture_0_to_7cm&forecast_days=1`;

      const response = await axios.get(url);
      const currentHour = new Date().getHours();

      const moisture = response.data.hourly.soil_moisture_0_to_7cm[currentHour] * 100; // Convert to percentage
      const temperature = response.data.hourly.soil_temperature_0_to_7cm[currentHour];

      return {
        moisture: moisture || 25.0,
        temperature: temperature || 15.0
      };
    } catch (error) {
      console.warn("Failed to fetch real soil data, falling back to simulation", error);
      return {
        moisture: 30 + Math.random() * 20,
        temperature: 15 + Math.random() * 10
      };
    }
  }
}
