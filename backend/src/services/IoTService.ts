import { AppDataSource } from '../db.js';
import { EnvironmentalAssessment } from '../models/Assessment.js';
import { CommunityReport } from '../models/Report.js';
import { RiskEngine } from './RiskEngine.js';

export class IoTService {
  /**
   * Generates simulated hyper-local sensor data for a given region.
   */
  static async getHyperLocalSensors(lat: number, lon: number) {
    const sensors = [];
    const count = 5;

    for (let i = 0; i < count; i++) {
      const offsetLat = (Math.random() - 0.5) * 0.02;
      const offsetLon = (Math.random() - 0.5) * 0.02;

      const aqi = Math.floor(Math.random() * 150);
      const temp = 20 + Math.random() * 15;

      sensors.push({
        id: `sensor-${i}`,
        lat: lat + offsetLat,
        lon: lon + offsetLon,
        aqi,
        temp,
        humidity: 40 + Math.random() * 50,
        status: Math.random() > 0.1 ? 'online' : 'offline',
        lastUpdate: new Date().toISOString(),
        anomalies: this.detectAnomalies(aqi, temp)
      });
    }

    return sensors;
  }

  private static detectAnomalies(aqi: number, temp: number) {
    const anomalies = [];
    if (aqi > 200) anomalies.push('CRITICAL_AQI_SPIKE');
    if (temp > 45) anomalies.push('EXTREME_THERMAL_ANOMALY');
    if (temp < -20) anomalies.push('SENSORS_FREEZE_WARNING');
    return anomalies;
  }
}
