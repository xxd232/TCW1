import axios from 'axios';
import { PayPalPayment } from '../types';

export class PayPalService {
  private clientId: string;
  private clientSecret: string;
  private baseUrl: string;

  constructor() {
    // These should come from environment variables
    this.clientId = process.env.PAYPAL_CLIENT_ID || 'demo-client-id';
    this.clientSecret = process.env.PAYPAL_CLIENT_SECRET || 'demo-secret';
    this.baseUrl = process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com';
  }

  // Get OAuth token from PayPal
  async getAccessToken(): Promise<string | null> {
    try {
      // In demo mode, return mock token
      if (this.clientId === 'demo-client-id') {
        return 'demo-access-token';
      }

      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      const response = await axios.post(
        `${this.baseUrl}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      return response.data.access_token;
    } catch (error) {
      console.error('PayPal auth error:', error);
      return null;
    }
  }

  // Create PayPal payment
  async createPayment(payment: PayPalPayment): Promise<{ success: boolean; paymentId?: string; error?: string }> {
    try {
      // In demo mode, simulate successful payment
      if (this.clientId === 'demo-client-id') {
        const mockPaymentId = `PAY-${Math.random().toString(36).substring(2, 15)}`;
        return {
          success: true,
          paymentId: mockPaymentId,
        };
      }

      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        return { success: false, error: 'Failed to authenticate with PayPal' };
      }

      const response = await axios.post(
        `${this.baseUrl}/v1/payments/payment`,
        {
          intent: 'sale',
          payer: {
            payment_method: 'paypal',
          },
          transactions: [
            {
              amount: {
                total: payment.amount.toFixed(2),
                currency: payment.currency,
              },
              description: payment.description,
              payee: {
                email: payment.recipientEmail,
              },
            },
          ],
          redirect_urls: {
            return_url: 'http://localhost:3000/success',
            cancel_url: 'http://localhost:3000/cancel',
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        paymentId: response.data.id,
      };
    } catch (error: any) {
      console.error('PayPal payment error:', error);
      return {
        success: false,
        error: error.message || 'PayPal payment failed',
      };
    }
  }

  // Verify PayPal payment
  async verifyPayment(paymentId: string): Promise<boolean> {
    try {
      // In demo mode, always verify successfully
      if (this.clientId === 'demo-client-id') {
        return true;
      }

      const accessToken = await this.getAccessToken();
      if (!accessToken) return false;

      const response = await axios.get(
        `${this.baseUrl}/v1/payments/payment/${paymentId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.state === 'approved';
    } catch (error) {
      console.error('PayPal verification error:', error);
      return false;
    }
  }
}

export const paypalService = new PayPalService();
