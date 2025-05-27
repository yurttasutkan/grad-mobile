import axios from 'axios';
import api from './api';

export const register = async (name: string, lastName: string, email: string, password: string) => {
  try {
    const response = await api.post(`/auth/register`, { name, lastName, email, password });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || "Registration failed!";
    } else {
      throw "Registration failed!";
    }
  }
};

export const login = async (email: string, password: string) => {
  try {
    const response = await api.post(`/auth/login`, { email, password });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error:', error.response?.data);
      throw error.response?.data || "Login failed!";
    } else {
      console.error('Error:', error);
      throw "Login failed!";
    }
  }
};

export const getUser = async (token: string) => {
  try {
    console.log('Fetching user info with token:', token);
    const response = await api.get(`/auth/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.user;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || "Failed to fetch user info!";
    } else {
      throw "Failed to fetch user info!";
    }
  }
};
