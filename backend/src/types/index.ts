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
