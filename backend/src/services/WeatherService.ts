import axios from 'axios';
import type { EnvironmentalData } from '../types/index.js';
import { config } from '../config/index.js';
import { cacheGet, cacheSet } from './CacheService.js';

export class WeatherService {
  static async getEnvironmentalData(lat: number, lon: number): Promise<Partial<EnvironmentalData>> {
    const cacheKey = `weather:${lat.toFixed(2)}:${lon.toFixed(2)}`;
    const cached = await cacheGet<Partial<EnvironmentalData>>(cacheKey);
    if (cached) return cached;
    if (!config.OPENWEATHER_API_KEY || config.OPENWEATHER_API_KEY === 'your_api_key_here') {
      return this.getSimulatedData(lat, lon);
    }

    try {
      // 1. Fetch Current Weather
      const weatherRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${config.OPENWEATHER_API_KEY}&units=metric`
      );

      // 2. Fetch Air Pollution
      const airRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${config.OPENWEATHER_API_KEY}`
      );

      // 3. Fetch UV Index (Using One Call 3.0 if available, but for 2.5 it was separate,
      // however many keys now have One Call 3.0 access)
      // For simplicity and common key access, we'll try to use a fallback or specific UV endpoint if needed,
      // but Air Pollution often gives enough for risk.
      // UV is available in One Call 3.0. Let's assume standard Current + Air Pollution for now.

      const weatherData = weatherRes.data;
      const airData = airRes.data.list[0];

      // Fetch UV Index from Open-Meteo as fallback/primary
      let uvIndex = 2.5;
      try {
        const omRes = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=uv_index`);
        uvIndex = omRes.data.current.uv_index;
      } catch (e) {
        console.warn("Open-Meteo UV fetch failed");
      }

      const result = {
        location: { lat, lon, name: weatherData.name },
        weather: {
          temp: weatherData.main.temp,
          condition: weatherData.weather[0].main,
          humidity: weatherData.main.humidity,
          windSpeed: weatherData.wind.speed,
          precipitation: weatherData.rain ? (weatherData.rain['1h'] || weatherData.rain['3h'] || 0) : 0
        },
        airQuality: {
          aqi: this.mapOpenWeatherAQI(airData.main.aqi),
          pm25: airData.components.pm2_5,
          pm10: airData.components.pm10
        },
        uvIndex
      };

      await cacheSet(cacheKey, result, 1800); // Cache for 30 mins
      return result;
    } catch (error) {
      console.error("Error fetching weather data:", error);
      // Fallback to simulation if API fails but key was present (e.g. rate limit)
      return this.getSimulatedData(lat, lon);
    }
  }

  private static mapOpenWeatherAQI(owAQI: number): number {
    // OpenWeather AQI is 1-5 (Good, Fair, Moderate, Poor, Very Poor)
    // Common AQI scales are 0-500. We'll map for visual consistency.
    const mapping: Record<number, number> = {
      1: 25,
      2: 75,
      3: 125,
      4: 175,
      5: 250
    };
    return mapping[owAQI] || 50;
  }

  private static getSimulatedData(lat: number, lon: number): Partial<EnvironmentalData> {
    const data = {
      location: { lat, lon, name: "Simulated Location" },
      weather: {
        temp: 15 + Math.random() * 10,
        condition: "Clear",
        humidity: 40 + Math.random() * 20,
        windSpeed: 5 + Math.random() * 10,
        precipitation: Math.random() > 0.8 ? Math.random() * 10 : 0
      },
      airQuality: {
        aqi: 30 + Math.random() * 40,
        pm25: 5 + Math.random() * 5,
        pm10: 10 + Math.random() * 10
      },
      uvIndex: 1 + Math.random() * 5
    };
    return data;
  }
}
