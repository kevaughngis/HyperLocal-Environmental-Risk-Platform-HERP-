import "reflect-metadata";
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from './config/index.js';
import riskRoutes from './routes/risk.js';
import { initializeDatabase } from './db.js';
import { initializeRedis } from './services/CacheService.js';

const app = express();
const port = config.PORT;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'HERP Backend is running' });
});

app.use('/api/v1', riskRoutes);

// Initialize services in background to avoid blocking server start
initializeDatabase();
initializeRedis();

app.listen(port, () => {
  console.log(`HERP Backend listening at http://localhost:${port}`);
});
