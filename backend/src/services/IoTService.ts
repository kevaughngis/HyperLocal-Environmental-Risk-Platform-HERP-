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

      sensors.push({
        id: `sensor-${i}`,
        lat: lat + offsetLat,
        lon: lon + offsetLon,
        aqi: Math.floor(Math.random() * 150),
        temp: 20 + Math.random() * 15,
        humidity: 40 + Math.random() * 50,
        status: Math.random() > 0.1 ? 'online' : 'offline',
        lastUpdate: new Date().toISOString()
      });
    }

    return sensors;
  }
}
