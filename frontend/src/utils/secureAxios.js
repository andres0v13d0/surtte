import axios from 'axios';
import { getIdToken } from 'firebase/auth';
import { auth } from '../config/firebase'; // Ajusta si usas otra ruta

const secureAxios = axios.create({
  baseURL: 'https://api.surtte.com',
});

secureAxios.interceptors.request.use(async (config) => {
  const user = auth.currentUser;

  if (!user) throw new Error('Usuario no autenticado');

  const token = await getIdToken(user, true); // fuerza renovación

  config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default secureAxios;
