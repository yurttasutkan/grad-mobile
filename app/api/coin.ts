import axios from 'axios';
import api from './api';

export const getAllCryptoPrices = async () => {
  try {
    const response = await api.get('/crypto-prices');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || 'Failed to fetch crypto prices';
    } else {
      throw 'Failed to fetch crypto prices';
    }
  }
};
