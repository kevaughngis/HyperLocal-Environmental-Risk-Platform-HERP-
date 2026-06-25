import type { EnvironmentalData } from '../types/index.js';

export class ComplianceService {
  static getReminders(data: Partial<EnvironmentalData>): string[] {
    const reminders: string[] = [];

    // 1. Dust Suppression (Based on Wind + Soil Moisture)
    if (data.weather && data.weather.windSpeed > 30) {
      if (data.soil && data.soil.moisture < 30) {
        reminders.push("MANDATORY: Activate dust suppression systems (wind > 30km/h and low soil moisture).");
      } else {
        reminders.push("ADVISORY: Monitor dust levels due to high winds.");
      }
    }

    // 2. Runoff & Sediment Control (Based on Precipitation)
    if (data.weather && (data.weather.precipitation || 0) > 15) {
      reminders.push("STORM ALERT: Inspect erosion and sediment control barriers immediately.");
    }

    // 3. Burn Restrictions (Based on Temp, Wind, and Dryness)
    if (data.soil && data.soil.moisture < 15 && data.weather && data.weather.temp > 28) {
      reminders.push("TOTAL BURN BAN: Extreme fire risk detected (high temp + low moisture).");
    } else if (data.soil && data.soil.moisture < 25) {
      reminders.push("BURN RESTRICTION: Open fires discouraged due to dry soil conditions.");
    }

    // 4. Heat Stress Compliance (OSHA/Municipal)
    if (data.weather && data.weather.temp > 35) {
      reminders.push("WORK SAFETY: High heat alert. Implement 'Water, Rest, Shade' protocols for outdoor workers.");
    }

    // 5. Air Quality (Municipal)
    if (data.airQuality && data.airQuality.aqi > 150) {
      reminders.push("AQI ADVISORY: Suspend non-essential heavy machinery operation to reduce local emissions.");
    }

    if (reminders.length === 0) {
      reminders.push("No active environmental compliance alerts.");
    }

    return reminders;
  }
}
