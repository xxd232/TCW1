export type Currency = 'BTC' | 'USDT' | 'ETH' | 'PAYPAL' | 'USD';

export interface Wallet {
  userId: string;
  balances: {
    BTC: number;
    USDT: number;
    ETH: number;
    PAYPAL: number;
    USD: number;
  };
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'send' | 'receive';
  currency: Currency;
  amount: number;
  recipientId?: string;
  senderId?: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
  txHash?: string;
}

export interface CryptoPrices {
  BTC: number;
  ETH: number;
  USDT: number;
  currency: string;
}

export interface BankAccount {
  id: string;
  userId: string;
  accountNumber: string;
  routingNumber: string;
  accountType: 'checking' | 'savings';
  bankName: string;
  accountHolderName: string;
  isVerified: boolean;
  isPrimary: boolean;
  createdAt: string;
  lastUsed?: string;
}

export interface BankTransaction {
  id: string;
  userId: string;
  bankAccountId: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  transferType: 'ACH' | 'WIRE';
  description?: string;
  timestamp: string;
  completedAt?: string;
  failureReason?: string;
}
