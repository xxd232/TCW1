import { Router, Request, Response } from 'express';
import { walletService } from '../services/wallet.service';
import { cryptoService } from '../services/crypto.service';
import { PaymentRequest } from '../types';

const router = Router();

// Get wallet balance
router.get('/:userId/balance', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const wallet = walletService.getWallet(userId);
    
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    res.json({
      userId: wallet.userId,
      balances: wallet.balances,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get transactions
router.get('/:userId/transactions', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const transactions = walletService.getTransactions(userId);
    
    res.json({
      userId,
      transactions,
      count: transactions.length,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add funds (for testing/deposit simulation)
router.post('/:userId/deposit', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { currency, amount } = req.body;

    if (!currency || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid currency or amount' });
    }

    const success = walletService.addFunds(userId, currency, amount);
    
    if (!success) {
      return res.status(400).json({ error: 'Failed to add funds' });
    }

    const wallet = walletService.getWallet(userId);
    res.json({
      success: true,
      balance: wallet?.balances[currency],
      message: `Added ${amount} ${currency} to wallet`,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Send payment
router.post('/send', (req: Request, res: Response) => {
  try {
    const { userId, currency, amount, recipientId } = req.body;

    if (!userId || !currency || !amount || !recipientId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be positive' });
    }

    const paymentRequest: PaymentRequest = {
      userId,
      currency,
      amount,
      recipientId,
    };

    const result = walletService.sendPayment(paymentRequest);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    // Simulate blockchain transaction for crypto currencies
    if (currency !== 'PAYPAL') {
      const txHash = cryptoService.simulateBlockchainTransaction(currency, amount);
      if (result.transaction) {
        result.transaction.txHash = txHash;
      }
    }

    res.json({
      success: true,
      transaction: result.transaction,
      message: `Sent ${amount} ${currency} to ${recipientId}`,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Generate crypto address
router.get('/address/:type', (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    
    let address: string;
    if (type === 'bitcoin' || type === 'BTC') {
      address = cryptoService.generateBitcoinAddress();
    } else if (type === 'ethereum' || type === 'ETH' || type === 'USDT') {
      address = cryptoService.generateEthereumAddress();
    } else {
      return res.status(400).json({ error: 'Invalid address type' });
    }

    res.json({
      type,
      address,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get crypto prices
router.get('/crypto/prices', async (req: Request, res: Response) => {
  try {
    const btcPrice = await cryptoService.getCryptoPrice('BTC');
    const ethPrice = await cryptoService.getCryptoPrice('ETH');
    const usdtPrice = await cryptoService.getCryptoPrice('USDT');

    res.json({
      BTC: btcPrice,
      ETH: ethPrice,
      USDT: usdtPrice,
      currency: 'USD',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
