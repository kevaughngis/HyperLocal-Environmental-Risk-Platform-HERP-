import "reflect-metadata";
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { createServer } from 'http';
import { config } from './config/index.js';
import riskRoutes from './routes/risk.js';
import reportRoutes from './routes/reports.js';
import { initializeDatabase } from './db.js';
import { initializeRedis } from './services/CacheService.js';
import { initializeSocket } from './services/SocketService.js';

const app = express();
const httpServer = createServer(app);
const port = config.PORT;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'HERP Backend is running' });
});

app.use('/api/v1', riskRoutes);
app.use('/api/v1/reports', reportRoutes);

async function startServer() {
  try {
    await initializeDatabase();
    await initializeRedis();
    initializeSocket(httpServer);

    httpServer.listen(port, () => {
      console.log(`HERP Backend listening at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
