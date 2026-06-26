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

  /**
   * Identifies clusters of hazards (Heatmapping)
   */
  static async getHazardHotzones(lat: number, lon: number, radiusKm: number = 100) {
    // Uses ST_ClusterDBSCAN to find spatial clusters of reports
    // This is a state-of-the-art geospatial analysis for identifying emerging local threats
    const clusters = await this.repository.query(`
      SELECT
        ST_AsText(ST_Centroid(ST_Collect(location))) as center,
        count(*) as intensity,
        type,
        cid
      FROM (
        SELECT
          location,
          type,
          ST_ClusterDBSCAN(location, eps := 0.01, minpoints := 2) OVER(PARTITION BY type) AS cid
        FROM community_report
        WHERE isActive = true
        AND ST_DWithin(location, ST_SetSRID(ST_Point($1, $2), 4326), $3)
      ) sq
      WHERE cid IS NOT NULL
      GROUP BY cid, type
    `, [lon, lat, radiusKm * 1000]);

    return clusters.map((c: any) => {
      const match = c.center.match(/POINT\((.+) (.+)\)/);
      return {
        lat: parseFloat(match[2]),
        lon: parseFloat(match[1]),
        intensity: parseInt(c.intensity),
        type: c.type,
        label: `${c.type} Cluster (Hotzone)`
      };
    });
  }
}
