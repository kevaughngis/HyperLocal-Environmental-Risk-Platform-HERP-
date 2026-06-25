import type { Request, Response } from 'express';
import { ReportService } from '../services/ReportService.js';
import { z } from 'zod';

const CreateReportSchema = z.object({
  lat: z.number(),
  lon: z.number(),
  type: z.string(),
  description: z.string(),
  imageUrl: z.string().optional()
});

export class ReportController {
  static async create(req: Request, res: Response) {
    try {
      const data = CreateReportSchema.parse(req.body);
      const report = await ReportService.createReport(data as any);
      res.status(201).json(report);
    } catch (error) {
      res.status(400).json({ error: 'Invalid report data' });
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const lat = parseFloat(req.query.lat as string) || 45.4215;
      const lon = parseFloat(req.query.lon as string) || -75.6972;
      const reports = await ReportService.getActiveReports(lat, lon);
      res.json(reports);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch reports' });
    }
  }
}
