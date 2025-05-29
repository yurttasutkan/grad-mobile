// src/api/order.ts
import axios from 'axios';
import api from './api';

export const getPortfolio = async (jwtToken: string) => {
  try {
    console.log(jwtToken, 'Fetching portfolio with token');
    const response = await api.get('/user/portfolio', {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching portfolio:', error);
      throw error.response?.data || 'Failed to fetch portfolio';
    } else {
      throw 'Failed to fetch portfolio';
    }
  }
};

export const placeBuyOrder = async (jwtToken: string, symbol: string, quantity: number, orderType = 'MARKET') => {
  try {
    console.log(`Placing buy order: ${symbol}, qty: ${quantity}, type: ${orderType}`);
    const response = await api.post(
      '/order/buy',
      {
        symbol,
        quantity,
        order_type: orderType,
      },
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || 'Failed to place buy order';
    } else {
      throw 'Failed to place buy order';
    }
  }
};

export const placeSellOrder = async (jwtToken: string, symbol: string, quantity: number, orderType = 'MARKET') => {
  try {
    console.log(`Placing sell order: ${symbol}, qty: ${quantity}, type: ${orderType}`);
    const response = await api.post(
      '/order/sell',
      {
        symbol,
        quantity,
        order_type: orderType,
      },
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || 'Failed to place sell order';
    } else {
      throw 'Failed to place sell order';
    }
  }
};

export const getTransactions = async (jwtToken: string) => {
  try {
    const response = await api.get('/user/transactions', {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });
    console.log('Fetched transactions:', response.data.transactions);
    return response.data.transactions;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || 'Failed to fetch transactions';
    } else {
      throw 'Failed to fetch transactions';
    }
  }
};

export const saveTransaction = async (jwtToken: string, orderData: any) => {
  try {
    const response = await api.post(
      '/save-transaction',
      orderData,
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || 'Failed to save transaction';
    } else {
      throw 'Failed to save transaction';
    }
  }
};