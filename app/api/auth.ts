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
        console.log(' heree')
        const response = await api.post(`/auth/login`, { email, password });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error:', error.response?.data);
        } else {
            console.error('Error:', error);
        }
    }
};
