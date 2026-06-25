import { AppDataSource } from '../db.js';
import { CommunityReport, HazardType } from '../models/Report.js';

export class ReportService {
  private static repository = AppDataSource.getRepository(CommunityReport);

  static async createReport(data: { lat: number; lon: number; type: HazardType; description: string; imageUrl?: string }) {
    const report = this.repository.create({
      latitude: data.lat,
      longitude: data.lon,
      location: `POINT(${data.lon} ${data.lat})`,
      type: data.type,
      description: data.description,
      imageUrl: data.imageUrl ?? null
    });
    return await this.repository.save(report);
  }

  static async getActiveReports(lat: number, lon: number, radiusKm: number = 50) {
    return await this.repository
      .createQueryBuilder('report')
      .where('ST_DWithin(report.location, ST_SetSRID(ST_Point(:lon, :lat), 4326), :radius)')
      .andWhere('report.isActive = :isActive')
      .setParameters({
        lon,
        lat,
        radius: radiusKm * 1000, // radius in meters
        isActive: true
      })
      .orderBy('report.createdAt', 'DESC')
      .getMany();
  }
}
