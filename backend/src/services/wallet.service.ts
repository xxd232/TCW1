import { v4 as uuidv4 } from 'uuid';
import { Wallet, Transaction, PaymentRequest } from '../types';

// In-memory storage (in production, use a database)
const wallets = new Map<string, Wallet>();
const transactions: Transaction[] = [];

export class WalletService {
  // Create a new wallet for a user
  createWallet(userId: string): Wallet {
    const wallet: Wallet = {
      userId,
      balances: {
        BTC: 0,
        USDT: 0,
        ETH: 0,
        PAYPAL: 0,
      },
    };
    wallets.set(userId, wallet);
    return wallet;
  }

  // Get wallet for a user
  getWallet(userId: string): Wallet | undefined {
    let wallet = wallets.get(userId);
    if (!wallet) {
      wallet = this.createWallet(userId);
    }
    return wallet;
  }

  // Get balance for specific currency
  getBalance(userId: string, currency: 'BTC' | 'USDT' | 'ETH' | 'PAYPAL'): number {
    const wallet = this.getWallet(userId);
    return wallet ? wallet.balances[currency] : 0;
  }

  // Add funds to wallet (for testing/deposit simulation)
  addFunds(userId: string, currency: 'BTC' | 'USDT' | 'ETH' | 'PAYPAL', amount: number): boolean {
    const wallet = this.getWallet(userId);
    if (wallet && amount > 0) {
      wallet.balances[currency] += amount;
      
      // Record transaction
      const transaction: Transaction = {
        id: uuidv4(),
        userId,
        type: 'receive',
        currency,
        amount,
        status: 'completed',
        timestamp: new Date(),
      };
      transactions.push(transaction);
      
      return true;
    }
    return false;
  }

  // Send payment
  sendPayment(request: PaymentRequest): { success: boolean; transaction?: Transaction; error?: string } {
    const senderWallet = this.getWallet(request.userId);
    const recipientWallet = this.getWallet(request.recipientId);

    if (!senderWallet || !recipientWallet) {
      return { success: false, error: 'Wallet not found' };
    }

    if (senderWallet.balances[request.currency] < request.amount) {
      return { success: false, error: 'Insufficient balance' };
    }

    // Deduct from sender
    senderWallet.balances[request.currency] -= request.amount;

    // Add to recipient
    recipientWallet.balances[request.currency] += request.amount;

    // Create transaction record for sender
    const sendTransaction: Transaction = {
      id: uuidv4(),
      userId: request.userId,
      type: 'send',
      currency: request.currency,
      amount: request.amount,
      recipientId: request.recipientId,
      status: 'completed',
      timestamp: new Date(),
    };
    transactions.push(sendTransaction);

    // Create transaction record for recipient
    const receiveTransaction: Transaction = {
      id: uuidv4(),
      userId: request.recipientId,
      type: 'receive',
      currency: request.currency,
      amount: request.amount,
      senderId: request.userId,
      status: 'completed',
      timestamp: new Date(),
    };
    transactions.push(receiveTransaction);

    return { success: true, transaction: sendTransaction };
  }

  // Get user transactions
  getTransactions(userId: string): Transaction[] {
    return transactions.filter(tx => tx.userId === userId);
  }

  // Get all wallets (for admin purposes)
  getAllWallets(): Wallet[] {
    return Array.from(wallets.values());
  }
}

export const walletService = new WalletService();
