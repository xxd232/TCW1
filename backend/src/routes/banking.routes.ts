import { Router, Request, Response } from 'express';
import { bankingService } from '../services/banking.service';
import { BankTransferRequest } from '../types';

const router = Router();

// Link a bank account
router.post('/accounts/link', async (req: Request, res: Response) => {
  try {
    const { userId, accountNumber, routingNumber, accountType, bankName, accountHolderName } = req.body;

    if (!userId || !accountNumber || !routingNumber || !accountType || !bankName || !accountHolderName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['checking', 'savings'].includes(accountType)) {
      return res.status(400).json({ error: 'Invalid account type' });
    }

    const bankAccount = await bankingService.linkBankAccount(userId, {
      accountNumber,
      routingNumber,
      accountType,
      bankName,
      accountHolderName
    });

    res.json({
      success: true,
      bankAccount,
      message: 'Bank account linked successfully'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get linked bank accounts
router.get('/accounts/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const accounts = await bankingService.getBankAccounts(userId);
    
    res.json({
      userId,
      accounts,
      count: accounts.length
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Remove a bank account
router.delete('/accounts/:userId/:accountId', async (req: Request, res: Response) => {
  try {
    const { userId, accountId } = req.params;
    const success = await bankingService.removeBankAccount(userId, accountId);
    
    if (!success) {
      return res.status(404).json({ error: 'Bank account not found' });
    }

    res.json({
      success: true,
      message: 'Bank account removed successfully'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Set primary bank account
router.put('/accounts/:userId/:accountId/primary', async (req: Request, res: Response) => {
  try {
    const { userId, accountId } = req.params;
    const success = await bankingService.setPrimaryAccount(userId, accountId);
    
    if (!success) {
      return res.status(404).json({ error: 'Bank account not found' });
    }

    res.json({
      success: true,
      message: 'Primary account updated'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Verify bank account
router.post('/accounts/:userId/:accountId/verify', async (req: Request, res: Response) => {
  try {
    const { userId, accountId } = req.params;
    const success = await bankingService.verifyBankAccount(userId, accountId);
    
    if (!success) {
      return res.status(404).json({ error: 'Bank account not found' });
    }

    res.json({
      success: true,
      message: 'Bank account verified successfully'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Deposit from bank to wallet
router.post('/deposit', async (req: Request, res: Response) => {
  try {
    const { userId, bankAccountId, amount, transferType, description } = req.body;

    if (!userId || !bankAccountId || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be positive' });
    }

    // Security: Set maximum transfer limits
    const MAX_ACH_AMOUNT = 100000; // $100,000
    const MAX_WIRE_AMOUNT = 1000000; // $1,000,000
    const maxAmount = transferType === 'WIRE' ? MAX_WIRE_AMOUNT : MAX_ACH_AMOUNT;
    
    if (amount > maxAmount) {
      return res.status(400).json({ 
        error: `Amount exceeds maximum ${transferType} transfer limit of $${maxAmount.toLocaleString()}` 
      });
    }

    if (!['ACH', 'WIRE'].includes(transferType)) {
      return res.status(400).json({ error: 'Invalid transfer type' });
    }

    const request: BankTransferRequest = {
      userId,
      bankAccountId,
      amount,
      type: 'deposit',
      transferType,
      description
    };

    const result = await bankingService.depositFromBank(request);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      transaction: result.transaction,
      message: `Deposit of $${amount} initiated via ${transferType}`
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Withdraw from wallet to bank
router.post('/withdraw', async (req: Request, res: Response) => {
  try {
    const { userId, bankAccountId, amount, transferType, description } = req.body;

    if (!userId || !bankAccountId || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be positive' });
    }

    // Security: Set maximum transfer limits
    const MAX_ACH_AMOUNT = 100000; // $100,000
    const MAX_WIRE_AMOUNT = 1000000; // $1,000,000
    const maxAmount = transferType === 'WIRE' ? MAX_WIRE_AMOUNT : MAX_ACH_AMOUNT;
    
    if (amount > maxAmount) {
      return res.status(400).json({ 
        error: `Amount exceeds maximum ${transferType} transfer limit of $${maxAmount.toLocaleString()}` 
      });
    }

    if (!['ACH', 'WIRE'].includes(transferType)) {
      return res.status(400).json({ error: 'Invalid transfer type' });
    }

    const request: BankTransferRequest = {
      userId,
      bankAccountId,
      amount,
      type: 'withdrawal',
      transferType,
      description
    };

    const result = await bankingService.withdrawToBank(request);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      transaction: result.transaction,
      message: `Withdrawal of $${amount} initiated via ${transferType}`
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get bank transactions
router.get('/transactions/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    
    const transactions = await bankingService.getBankTransactions(userId, limit);
    
    res.json({
      userId,
      transactions,
      count: transactions.length
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
