import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Wallet, Transaction, Currency, CryptoPrices, BankAccount, BankTransaction } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

export const api = {
  // Generic POST helper for auth and other endpoints
  async post<T = any, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return axios.post(`${API_BASE_URL}${url}`, data, config);
  },

  // Generic GET helper
  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return axios.get(`${API_BASE_URL}${url}`, config);
  },

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

  // Banking APIs
  
  // Link a bank account
  async linkBankAccount(
    userId: string,
    accountData: {
      accountNumber: string;
      routingNumber: string;
      accountType: 'checking' | 'savings';
      bankName: string;
      accountHolderName: string;
    }
  ): Promise<any> {
    const response = await axios.post(`${API_BASE_URL}/banking/accounts/link`, {
      userId,
      ...accountData
    });
    return response.data;
  },

  // Get linked bank accounts
  async getBankAccounts(userId: string): Promise<BankAccount[]> {
    const response = await axios.get(`${API_BASE_URL}/banking/accounts/${userId}`);
    return response.data.accounts;
  },

  // Remove a bank account
  async removeBankAccount(userId: string, accountId: string): Promise<any> {
    const response = await axios.delete(`${API_BASE_URL}/banking/accounts/${userId}/${accountId}`);
    return response.data;
  },

  // Set primary bank account
  async setPrimaryBankAccount(userId: string, accountId: string): Promise<any> {
    const response = await axios.put(`${API_BASE_URL}/banking/accounts/${userId}/${accountId}/primary`);
    return response.data;
  },

  // Verify bank account
  async verifyBankAccount(userId: string, accountId: string): Promise<any> {
    const response = await axios.post(`${API_BASE_URL}/banking/accounts/${userId}/${accountId}/verify`);
    return response.data;
  },

  // Deposit from bank to wallet
  async depositFromBank(
    userId: string,
    bankAccountId: string,
    amount: number,
    transferType: 'ACH' | 'WIRE',
    description?: string
  ): Promise<any> {
    const response = await axios.post(`${API_BASE_URL}/banking/deposit`, {
      userId,
      bankAccountId,
      amount,
      transferType,
      description
    });
    return response.data;
  },

  // Withdraw from wallet to bank
  async withdrawToBank(
    userId: string,
    bankAccountId: string,
    amount: number,
    transferType: 'ACH' | 'WIRE',
    description?: string
  ): Promise<any> {
    const response = await axios.post(`${API_BASE_URL}/banking/withdraw`, {
      userId,
      bankAccountId,
      amount,
      transferType,
      description
    });
    return response.data;
  },

  // Get bank transactions
  async getBankTransactions(userId: string, limit: number = 50): Promise<BankTransaction[]> {
    const response = await axios.get(`${API_BASE_URL}/banking/transactions/${userId}?limit=${limit}`);
    return response.data.transactions;
  },
};
