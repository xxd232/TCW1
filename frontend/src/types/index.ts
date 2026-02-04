export type Currency = 'BTC' | 'USDT' | 'ETH' | 'PAYPAL';

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
