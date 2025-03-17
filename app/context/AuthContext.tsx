import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as loginApi, register as registerApi } from '../api/auth';

interface AuthContextType {
  userToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, lastName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      const token = await AsyncStorage.getItem('userToken');
      setUserToken(token);
      setIsLoading(false);
    };
    loadToken();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await loginApi(email, password);
      console.log('JWT Token:', data.user.token);
      
      await AsyncStorage.setItem('userToken', data.user.token);
      setUserToken(data.user.token); // ✅ Fixed this

    } catch (error) {
      console.error('Login failed:', error);
      throw error; // Ensure error propagates
    }
  };

  const register = async (name: string, lastName: string, email: string, password: string) => {
    await registerApi(name, lastName, email, password);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('userToken');
    setUserToken(null);
  };

  return (
    <AuthContext.Provider value={{ userToken, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
