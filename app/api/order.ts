// src/api/order.ts
import axios from 'axios';
import api from './api';

export const getPortfolio = async () => {
  try {
    console.log('Fetching portfolio with PnL...');
    const response = await api.get('/order/portfolio');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || 'Failed to fetch portfolio';
    } else {
      throw 'Failed to fetch portfolio';
    }
  }
};

export const placeBuyOrder = async (symbol: string, quantity: number, orderType = 'MARKET') => {
  try {
    console.log(`Placing buy order: ${symbol}, qty: ${quantity}, type: ${orderType}`);
    const response = await api.post('/order/buy', {
      symbol,
      quantity,
      order_type: orderType,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || 'Failed to place buy order';
    } else {
      throw 'Failed to place buy order';
    }
  }
};

export const placeSellOrder = async (symbol: string, quantity: number, orderType = 'MARKET') => {
  try {
    console.log(`Placing sell order: ${symbol}, qty: ${quantity}, type: ${orderType}`);
    const response = await api.post('/order/sell', {
      symbol,
      quantity,
      order_type: orderType,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || 'Failed to place sell order';
    } else {
      throw 'Failed to place sell order';
    }
  }
};

export const getTransactions = async () => {
  try {
    const response = await api.get('/order/transactions');
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