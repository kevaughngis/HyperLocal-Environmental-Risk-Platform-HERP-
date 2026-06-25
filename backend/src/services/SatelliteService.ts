export interface SatelliteData {
  ndvi: number; // Normalized Difference Vegetation Index (0.0 - 1.0)
  lastPass: string;
  cloudCover: number;
  imageryUrl: string;
}

export class SatelliteService {
  static async getIntelligence(lat: number, lon: number): Promise<SatelliteData> {
    // In a real app, this would query Sentinel-2 or Landsat-8 STAC APIs
    // We simulate NDVI based on approximate seasonality and location
    const month = new Date().getMonth();
    const isGrowingSeason = month > 3 && month < 10;

    return {
      ndvi: isGrowingSeason ? 0.6 + Math.random() * 0.3 : 0.2 + Math.random() * 0.2,
      lastPass: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(),
      cloudCover: Math.random() * 100,
      imageryUrl: `https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/GoogleMapsCompatible/14/${Math.floor(lat)}/${Math.floor(lon)}.jpg`
    };
  }
}
