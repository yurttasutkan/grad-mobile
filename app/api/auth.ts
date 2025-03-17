import axios from 'axios';

const API_URL = "http://10.0.2.2:3000/api/auth"; // Change this if your backend is deployed

export const register = async (name: string, lastName: string, email: string, password: string) => {
    try {
        const response = await axios.post(`${API_URL}/register`, { name, lastName, email, password });
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
        const response = await axios.post(`${API_URL}/login`, { email, password });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error:', error.response?.data);
        } else {
            console.error('Error:', error);
        }
    }
};
