import { Router, Request, Response } from 'express';
import { paypalService } from '../services/paypal.service';
import { walletService } from '../services/wallet.service';

const router = Router();

// Create PayPal payment
router.post('/create', async (req: Request, res: Response) => {
  try {
    const { userId, amount, recipientEmail, description } = req.body;

    if (!userId || !amount || !recipientEmail) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be positive' });
    }

    // Check if user has sufficient balance
    const balance = walletService.getBalance(userId, 'PAYPAL');
    if (balance < amount) {
      return res.status(400).json({ error: 'Insufficient PayPal balance' });
    }

    const result = await paypalService.createPayment({
      amount,
      currency: 'USD',
      description: description || 'Payment via TCW1',
      recipientEmail,
    });

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      paymentId: result.paymentId,
      message: 'PayPal payment created successfully',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Verify PayPal payment
router.post('/verify/:paymentId', async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    
    const isValid = await paypalService.verifyPayment(paymentId);

    res.json({
      paymentId,
      verified: isValid,
      status: isValid ? 'approved' : 'pending',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
