import { Router } from 'express';
import { ReportController } from '../controllers/ReportController.js';

const router = Router();

router.post('/', ReportController.create);
router.get('/', ReportController.list);

export default router;
