import { Router } from 'express';
import { ReportController } from '../controllers/ReportController.js';
import { ReportService } from '../services/ReportService.js';

const router = Router();

router.get('/hotzones', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat as string) || 45.4215;
    const lon = parseFloat(req.query.lon as string) || -75.6972;
    const hotzones = await ReportService.getHazardHotzones(lat, lon);
    res.json(hotzones);
  } catch (error) {
    res.status(500).json({ error: 'Failed to analyze hazard hotzones' });
  }
});

router.post('/', ReportController.create);
router.get('/', ReportController.list);

export default router;
