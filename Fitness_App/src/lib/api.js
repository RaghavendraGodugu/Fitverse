import axios from 'axios';

const API_BASE_URL = import.meta.env.DEV
  ? 'http://localhost:5001'
  : (import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'https://fitverse-537h.onrender.com');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;

export const apiUrl = (path = '') => {
  if (!path) return API_BASE_URL;
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

export const getExercises = async () => {
  const response = await api.get('/api/exercises');
  return response.data;
};

export const getWorkouts = async () => {
  const response = await api.get('/api/workouts');
  return response.data;
};

export const createWorkout = async (workoutData) => {
  const response = await api.post('/api/workouts', workoutData);
  return response.data;
};

export const askAI = async (payload) => {
  const response = await api.post('/api/ai/chat', payload);
  return response.data;
};
