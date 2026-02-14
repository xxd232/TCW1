export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
}

export interface Wallet {
  userId: string;
  balances: {
    BTC: number;
    USDT: number;
    ETH: number;
    PAYPAL: number;
    USD: number; // Fiat balance from banking
  };
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'send' | 'receive';
  currency: 'BTC' | 'USDT' | 'ETH' | 'PAYPAL';
  amount: number;
  recipientId?: string;
  senderId?: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: Date;
  txHash?: string;
}

export interface PaymentRequest {
  userId: string;
  currency: 'BTC' | 'USDT' | 'ETH' | 'PAYPAL';
  amount: number;
  recipientId: string;
}

export interface PayPalPayment {
  amount: number;
  currency: string;
  description: string;
  recipientEmail: string;
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
  createdAt: Date;
  lastUsed?: Date;
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
  timestamp: Date;
  completedAt?: Date;
  failureReason?: string;
}

export interface BankTransferRequest {
  userId: string;
  bankAccountId: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
  transferType: 'ACH' | 'WIRE';
  description?: string;
}
