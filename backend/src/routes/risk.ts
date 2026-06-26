import { Router } from 'express';
import { getRiskAssessment } from '../controllers/RiskController.js';
import { IoTService } from '../services/IoTService.js';
import { EmergencyService } from '../services/EmergencyService.js';
import { ESGService } from '../services/ESGService.js';
import { ForecastingService } from '../services/ForecastingService.js';

const router = Router();

router.get('/evacuation', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat as string) || 45.4215;
    const lon = parseFloat(req.query.lon as string) || -75.6972;
    const routes = await EmergencyService.getSafeRoutes(lat, lon);
    res.json(routes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch evacuation routes' });
  }
});

router.get('/esg-report', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat as string) || 45.4215;
    const lon = parseFloat(req.query.lon as string) || -75.6972;
    const report = await ESGService.generateReport(lat, lon);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate ESG report' });
  }
});

router.get('/sensors', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat as string) || 45.4215;
    const lon = parseFloat(req.query.lon as string) || -75.6972;
    const sensors = await IoTService.getHyperLocalSensors(lat, lon);
    res.json(sensors);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sensor data' });
  }
});

router.get('/forecast', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat as string) || 45.4215;
    const lon = parseFloat(req.query.lon as string) || -75.6972;
    const forecast = await ForecastingService.get24hForecast(lat, lon);
    res.json(forecast);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate risk forecast' });
  }
});

router.get('/assessment', getRiskAssessment);

export default router;
