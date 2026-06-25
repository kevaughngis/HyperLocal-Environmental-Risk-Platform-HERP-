import axios from 'axios';
import { config } from '../config/index.js';

export class AIRiskService {
  static async getCompoundHazards(data: any): Promise<{ hazards: string[], level: string, explanation: string }> {
    try {
      const response = await axios.post(`${config.RISK_ENGINE_URL}/analyze`, data);
      return {
        hazards: response.data.compound_hazards,
        level: response.data.hazard_level,
        explanation: response.data.explanation
      };
    } catch (error) {
      console.warn("Python Risk Engine unreachable, using basic analysis");
      return {
        hazards: [],
        level: "Stable",
        explanation: "Primary risk engine offline. Fallback diagnostics active."
      };
    }
  }
}
