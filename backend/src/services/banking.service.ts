import { v4 as uuidv4 } from 'uuid';
import { BankAccount } from '../models/BankAccount';
import { BankTransaction } from '../models/BankTransaction';
import { BankAccount as BankAccountType, BankTransaction as BankTransactionType, BankTransferRequest } from '../types';
import { walletService } from './wallet.service';

export class BankingService {
  
  // Link a new bank account
  async linkBankAccount(
    userId: string,
    accountData: {
      accountNumber: string;
      routingNumber: string;
      accountType: 'checking' | 'savings';
      bankName: string;
      accountHolderName: string;
    }
  ): Promise<BankAccountType> {
    try {
      // Check if this is the user's first bank account
      const existingAccounts = await BankAccount.find({ userId });
      const isPrimary = existingAccounts.length === 0;

      const bankAccount = new BankAccount({
        userId,
        ...accountData,
        isVerified: false, // In production, implement verification (micro-deposits)
        isPrimary
      });

      const saved = await bankAccount.save();
      
      return {
        id: saved._id.toString(),
        userId: saved.userId,
        accountNumber: this.maskAccountNumber(saved.accountNumber),
        routingNumber: saved.routingNumber,
        accountType: saved.accountType,
        bankName: saved.bankName,
        accountHolderName: saved.accountHolderName,
        isVerified: saved.isVerified,
        isPrimary: saved.isPrimary,
        createdAt: saved.createdAt,
        lastUsed: saved.lastUsed
      };
    } catch (error: any) {
      throw new Error(`Failed to link bank account: ${error.message}`);
    }
  }

  // Get user's linked bank accounts
  async getBankAccounts(userId: string): Promise<BankAccountType[]> {
    try {
      const accounts = await BankAccount.find({ userId }).sort({ isPrimary: -1, createdAt: -1 });
      
      return accounts.map(acc => ({
        id: acc._id.toString(),
        userId: acc.userId,
        accountNumber: this.maskAccountNumber(acc.accountNumber),
        routingNumber: acc.routingNumber,
        accountType: acc.accountType,
        bankName: acc.bankName,
        accountHolderName: acc.accountHolderName,
        isVerified: acc.isVerified,
        isPrimary: acc.isPrimary,
        createdAt: acc.createdAt,
        lastUsed: acc.lastUsed
      }));
    } catch (error: any) {
      throw new Error(`Failed to get bank accounts: ${error.message}`);
    }
  }

  // Remove a bank account
  async removeBankAccount(userId: string, accountId: string): Promise<boolean> {
    try {
      const result = await BankAccount.deleteOne({ _id: accountId, userId });
      return result.deletedCount > 0;
    } catch (error: any) {
      throw new Error(`Failed to remove bank account: ${error.message}`);
    }
  }

  // Set primary bank account
  async setPrimaryAccount(userId: string, accountId: string): Promise<boolean> {
    try {
      // Remove primary status from all accounts
      await BankAccount.updateMany({ userId }, { isPrimary: false });
      
      // Set the new primary account
      const result = await BankAccount.updateOne(
        { _id: accountId, userId },
        { isPrimary: true }
      );
      
      return result.modifiedCount > 0;
    } catch (error: any) {
      throw new Error(`Failed to set primary account: ${error.message}`);
    }
  }

  // Deposit funds from bank to wallet
  async depositFromBank(request: BankTransferRequest): Promise<{ success: boolean; transaction?: BankTransactionType; error?: string }> {
    try {
      // Validate bank account exists and belongs to user
      const bankAccount = await BankAccount.findOne({ _id: request.bankAccountId, userId: request.userId });
      if (!bankAccount) {
        return { success: false, error: 'Bank account not found' };
      }

      if (!bankAccount.isVerified) {
        return { success: false, error: 'Bank account not verified. Please verify your account first.' };
      }

      // Create bank transaction record
      const bankTransaction = new BankTransaction({
        userId: request.userId,
        bankAccountId: request.bankAccountId,
        type: 'deposit',
        amount: request.amount,
        transferType: request.transferType,
        description: request.description || `Deposit from ${bankAccount.bankName}`,
        status: 'processing'
      });

      const saved = await bankTransaction.save();

      // Simulate transfer processing time
      // In production, this would involve actual ACH/Wire transfer processing
      setTimeout(async () => {
        try {
          // Add funds to wallet
          const success = walletService.addFunds(request.userId, 'USD', request.amount);
          
          if (success) {
            // Update transaction status
            await BankTransaction.updateOne(
              { _id: saved._id },
              { status: 'completed', completedAt: new Date() }
            );

            // Update last used date
            await BankAccount.updateOne(
              { _id: request.bankAccountId },
              { lastUsed: new Date() }
            );
          } else {
            await BankTransaction.updateOne(
              { _id: saved._id },
              { status: 'failed', failureReason: 'Failed to add funds to wallet' }
            );
          }
        } catch (error: any) {
          await BankTransaction.updateOne(
            { _id: saved._id },
            { status: 'failed', failureReason: error.message }
          );
        }
      }, request.transferType === 'ACH' ? 3000 : 1000); // ACH takes longer

      return {
        success: true,
        transaction: {
          id: saved._id.toString(),
          userId: saved.userId,
          bankAccountId: saved.bankAccountId,
          type: saved.type,
          amount: saved.amount,
          status: saved.status,
          transferType: saved.transferType,
          description: saved.description,
          timestamp: saved.timestamp,
          completedAt: saved.completedAt,
          failureReason: saved.failureReason
        }
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Withdraw funds from wallet to bank
  async withdrawToBank(request: BankTransferRequest): Promise<{ success: boolean; transaction?: BankTransactionType; error?: string }> {
    try {
      // Validate bank account exists and belongs to user
      const bankAccount = await BankAccount.findOne({ _id: request.bankAccountId, userId: request.userId });
      if (!bankAccount) {
        return { success: false, error: 'Bank account not found' };
      }

      if (!bankAccount.isVerified) {
        return { success: false, error: 'Bank account not verified. Please verify your account first.' };
      }

      // Check wallet balance
      const balance = walletService.getBalance(request.userId, 'USD');
      if (balance < request.amount) {
        return { success: false, error: 'Insufficient USD balance' };
      }

      // Deduct from wallet first
      const wallet = walletService.getWallet(request.userId);
      if (wallet) {
        wallet.balances.USD -= request.amount;
      }

      // Create bank transaction record
      const bankTransaction = new BankTransaction({
        userId: request.userId,
        bankAccountId: request.bankAccountId,
        type: 'withdrawal',
        amount: request.amount,
        transferType: request.transferType,
        description: request.description || `Withdrawal to ${bankAccount.bankName}`,
        status: 'processing'
      });

      const saved = await bankTransaction.save();

      // Simulate transfer processing
      setTimeout(async () => {
        try {
          // Update transaction status
          await BankTransaction.updateOne(
            { _id: saved._id },
            { status: 'completed', completedAt: new Date() }
          );

          // Update last used date
          await BankAccount.updateOne(
            { _id: request.bankAccountId },
            { lastUsed: new Date() }
          );
        } catch (error: any) {
          // Refund on failure
          if (wallet) {
            wallet.balances.USD += request.amount;
          }
          await BankTransaction.updateOne(
            { _id: saved._id },
            { status: 'failed', failureReason: error.message }
          );
        }
      }, request.transferType === 'ACH' ? 3000 : 1000);

      return {
        success: true,
        transaction: {
          id: saved._id.toString(),
          userId: saved.userId,
          bankAccountId: saved.bankAccountId,
          type: saved.type,
          amount: saved.amount,
          status: saved.status,
          transferType: saved.transferType,
          description: saved.description,
          timestamp: saved.timestamp,
          completedAt: saved.completedAt,
          failureReason: saved.failureReason
        }
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Get user's bank transactions
  async getBankTransactions(userId: string, limit: number = 50): Promise<BankTransactionType[]> {
    try {
      const transactions = await BankTransaction.find({ userId })
        .sort({ timestamp: -1 })
        .limit(limit);
      
      return transactions.map(tx => ({
        id: tx._id.toString(),
        userId: tx.userId,
        bankAccountId: tx.bankAccountId,
        type: tx.type,
        amount: tx.amount,
        status: tx.status,
        transferType: tx.transferType,
        description: tx.description,
        timestamp: tx.timestamp,
        completedAt: tx.completedAt,
        failureReason: tx.failureReason
      }));
    } catch (error: any) {
      throw new Error(`Failed to get bank transactions: ${error.message}`);
    }
  }

  // Verify bank account (in production, use micro-deposits or Plaid)
  async verifyBankAccount(userId: string, accountId: string): Promise<boolean> {
    try {
      // In production, implement actual verification
      // For demo, we'll just mark as verified
      const result = await BankAccount.updateOne(
        { _id: accountId, userId },
        { isVerified: true }
      );
      
      return result.modifiedCount > 0;
    } catch (error: any) {
      throw new Error(`Failed to verify bank account: ${error.message}`);
    }
  }

  // Helper: Mask account number for display
  private maskAccountNumber(accountNumber: string): string {
    if (accountNumber.length <= 4) {
      return accountNumber;
    }
    return '****' + accountNumber.slice(-4);
  }
}

export const bankingService = new BankingService();
