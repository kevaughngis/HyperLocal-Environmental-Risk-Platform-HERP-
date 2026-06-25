import { Router } from 'express';
import { getRiskAssessment } from '../controllers/RiskController.js';

const router = Router();

router.get('/assessment', getRiskAssessment);

export default router;
