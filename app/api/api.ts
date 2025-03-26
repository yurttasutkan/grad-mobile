import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

let api = axios.create({
  baseURL: 'http://10.0.2.2:3000/api', // Updated default baseURL
  });

// Attach token automatically
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('userToken'); // or use your own storage method
  if (token) {
    console.log(`Bearer ${token}`)
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;