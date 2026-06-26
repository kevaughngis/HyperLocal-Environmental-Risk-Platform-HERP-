import { HazardType } from '../models/Report.js';

export interface EvacuationRoute {
  id: string;
  name: string;
  path: [number, number][]; // Array of [lat, lon]
  status: 'Clear' | 'Congested' | 'Blocked';
  reason?: string | null;
}

import { ReportService } from './ReportService.js';

export class EmergencyService {
  static async getSafeRoutes(lat: number, lon: number): Promise<EvacuationRoute[]> {
    // In a real app, this would use a routing engine like OSRM or Valhalla
    // and exclude areas with high hazard intensity.

    // State-of-the-art Dynamic Hazard Weighting:
    // Fetch nearby hotzones to adjust route feasibility
    const hotzones = await ReportService.getHazardHotzones(lat, lon, 20);

    return [
      {
        id: 'route-north',
        name: 'Northern Emergency Exit (Primary)',
        path: [
          [lat, lon],
          [lat + 0.005, lon + 0.002],
          [lat + 0.012, lon + 0.003],
          [lat + 0.025, lon + 0.005]
        ],
        status: hotzones.length > 0 ? 'Congested' : 'Clear',
        reason: hotzones.length > 0 ? `Nearby active hazard cluster: ${hotzones[0].type}` : null
      },
      {
        id: 'route-west',
        name: 'Western Relief Route',
        path: [
          [lat, lon],
          [lat + 0.002, lon - 0.008],
          [lat + 0.005, lon - 0.015],
          [lat + 0.008, lon - 0.025]
        ],
        status: 'Congested',
        reason: 'Heavy traffic reported'
      }
    ];
  }
}
