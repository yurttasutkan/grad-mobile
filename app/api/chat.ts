// api/chat.ts
import axios from 'axios';
import api from './api';

export const chat = async (input: string) => {
  try {
    const response = await api.post('/chat', { input });
    return response.data;   
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || 'Chat request failed!';
    } else {
      throw 'Chat request failed!';
    }
  }
};
