import axios from 'axios';
import { Wallet, Transaction, Currency, CryptoPrices } from '../types';

const API_BASE_URL = '/api';

export const api = {
  // Get wallet balance
  async getBalance(userId: string): Promise<Wallet> {
    const response = await axios.get(`${API_BASE_URL}/wallet/${userId}/balance`);
    return response.data;
  },

  // Get transactions
  async getTransactions(userId: string): Promise<Transaction[]> {
    const response = await axios.get(`${API_BASE_URL}/wallet/${userId}/transactions`);
    return response.data.transactions;
  },

  // Add funds (deposit simulation)
  async deposit(userId: string, currency: Currency, amount: number): Promise<any> {
    const response = await axios.post(`${API_BASE_URL}/wallet/${userId}/deposit`, {
      currency,
      amount,
    });
    return response.data;
  },

  // Send payment
  async sendPayment(
    userId: string,
    currency: Currency,
    amount: number,
    recipientId: string
  ): Promise<any> {
    const response = await axios.post(`${API_BASE_URL}/wallet/send`, {
      userId,
      currency,
      amount,
      recipientId,
    });
    return response.data;
  },

  // Get crypto prices
  async getCryptoPrices(): Promise<CryptoPrices> {
    const response = await axios.get(`${API_BASE_URL}/wallet/crypto/prices`);
    return response.data;
  },

  // Generate crypto address
  async generateAddress(type: string): Promise<{ type: string; address: string }> {
    const response = await axios.get(`${API_BASE_URL}/wallet/address/${type}`);
    return response.data;
  },
};
