import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import Constants from 'expo-constants';

// 실기기에서는 Metro 서버 주소에서 IP를 추출해 서버 주소로 사용
const metroHost = Constants.expoConfig?.hostUri?.split(':')[0];
const BASE_URL = metroHost
  ? `http://${metroHost}:3000/api`
  : 'http://localhost:3000/api';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
