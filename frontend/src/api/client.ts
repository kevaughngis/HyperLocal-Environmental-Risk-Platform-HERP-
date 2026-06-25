import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getHealth = () => axios.get(`${API_BASE_URL.replace('/api/v1', '')}/health`);
export const getAssessment = (lat?: number, lon?: number) =>
  api.get('/assessment', { params: { lat, lon } });
