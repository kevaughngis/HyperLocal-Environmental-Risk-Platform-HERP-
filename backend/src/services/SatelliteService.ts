export interface SatelliteData {
  ndvi: number; // Normalized Difference Vegetation Index (0.0 - 1.0)
  urbanHeatIsland: {
    intensity: number;
    unit: string;
    risk: 'Low' | 'Normal' | 'High';
  };
  lastPass: string;
  cloudCover: number;
  imageryUrl: string;
}

export class SatelliteService {
  static async getIntelligence(lat: number, lon: number): Promise<SatelliteData> {
    // In a real app, this would query Sentinel-2 or Landsat-8 STAC APIs
    const month = new Date().getMonth();
    const isGrowingSeason = month > 3 && month < 10;
    const ndvi = isGrowingSeason ? 0.6 + Math.random() * 0.3 : 0.2 + Math.random() * 0.2;

    // Simulate Urban Heat Island intensity (UHI)
    const uhiIntensity = Math.random() > 0.6 ? 2 + Math.random() * 6 : Math.random() * 2;

    return {
      ndvi: parseFloat(ndvi.toFixed(2)),
      urbanHeatIsland: {
        intensity: parseFloat(uhiIntensity.toFixed(1)),
        unit: 'Celsius delta',
        risk: uhiIntensity > 5 ? 'High' : (uhiIntensity > 2 ? 'Normal' : 'Low')
      },
      lastPass: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(),
      cloudCover: Math.random() * 100,
      imageryUrl: `https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/GoogleMapsCompatible/14/${Math.floor(lat)}/${Math.floor(lon)}.jpg`
    };
  }
}
