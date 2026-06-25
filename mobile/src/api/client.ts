import axios from 'axios';
import Constants from 'expo-constants';

// For physical devices, you must use your machine's local IP address
// 10.0.2.2 is the alias for the host machine for Android Emulator
const DEFAULT_API_HOST = '10.0.2.2';
const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || `http://${DEFAULT_API_HOST}:3001/api/v1`;

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getAssessment = (lat: number, lon: number) =>
  api.get('/assessment', { params: { lat, lon } });
