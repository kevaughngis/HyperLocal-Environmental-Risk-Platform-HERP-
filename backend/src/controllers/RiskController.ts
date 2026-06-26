import type { Request, Response } from 'express';
import { RiskEngine } from '../services/RiskEngine.js';
import { WeatherService } from '../services/WeatherService.js';
import { PollenService } from '../services/PollenService.js';
import { FloodService } from '../services/FloodService.js';
import { SoilService } from '../services/SoilService.js';
import { WildfireService } from '../services/WildfireService.js';
import { SatelliteService } from '../services/SatelliteService.js';
import { ComplianceService } from '../services/ComplianceService.js';
import { AIRiskService } from '../services/AIRiskService.js';
import { WorkflowEngine } from '../services/WorkflowEngine.js';
import { AppDataSource } from '../db.js';
import { EnvironmentalAssessment } from '../models/Assessment.js';

export const getRiskAssessment = async (req: Request, res: Response) => {
  try {
    const lat = Number(req.query.lat) || 45.4215;
    const lon = Number(req.query.lon) || -75.6972;

    const weatherData = await WeatherService.getEnvironmentalData(lat, lon);
    const pollenData = await PollenService.getPollenData(lat, lon);
    const floodData = await FloodService.getFloodRisk(lat, lon, weatherData.weather?.precipitation || 0);
    const soilData = await SoilService.getSoilData(lat, lon);
    const wildfireData = await WildfireService.getWildfireSmoke(lat, lon);
    const satelliteData = await SatelliteService.getIntelligence(lat, lon);

    const combinedData = {
      ...weatherData,
      pollen: pollenData,
      floodRisk: floodData,
      soil: soilData,
      wildfire: wildfireData,
      satellite: satelliteData
    };

    const complianceReminders = ComplianceService.getReminders(combinedData);

    const aiRisk = await AIRiskService.getCompoundHazards(combinedData);
    const riskScore = RiskEngine.calculateScore(combinedData);
    const recommendations = RiskEngine.generateRecommendations(combinedData, riskScore);

    // Trigger Workflows
    WorkflowEngine.process({
      aqi: combinedData.airQuality?.aqi || 0,
      flood_score: combinedData.floodRisk?.score || 0,
      temp: combinedData.weather?.temp || 0,
      risk_score: riskScore
    });

    const assessment = {
      ...combinedData,
      compliance: {
        status: complianceReminders.length > 1 ? "Attention Required" : "Compliant",
        reminders: complianceReminders
      },
      aiRisk,
      riskScore,
      recommendations,
      timestamp: new Date().toISOString()
    };

    // Persist to database (optional, don't fail if DB is down)
    try {
      if (AppDataSource.isInitialized) {
        const assessmentRepo = AppDataSource.getRepository(EnvironmentalAssessment);
        const savedAssessment = assessmentRepo.create({
          latitude: lat,
          longitude: lon,
          location: `POINT(${lon} ${lat})`,
          riskScore: riskScore,
          details: combinedData,
          recommendations: recommendations
        });
        await assessmentRepo.save(savedAssessment);
      }
    } catch (dbError) {
      console.warn("Failed to persist assessment to database:", dbError);
    }

    res.json(assessment);
  } catch (error) {
    console.error("Risk Assessment Error:", error);
    res.status(500).json({ error: "Failed to generate risk assessment" });
  }
};
