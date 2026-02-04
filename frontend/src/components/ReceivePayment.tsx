import { useState } from 'react';
import { Currency } from '../types';
import { api } from '../services/api';
import './ReceivePayment.css';

interface ReceivePaymentProps {
  userId: string;
  onSuccess: () => void;
}

export const ReceivePayment: React.FC<ReceivePaymentProps> = ({ userId, onSuccess }) => {
  const [currency, setCurrency] = useState<Currency>('BTC');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount) {
      setMessage({ type: 'error', text: 'Please enter an amount' });
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setMessage({ type: 'error', text: 'Invalid amount' });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);
      
      await api.deposit(userId, currency, amountNum);
      
      setMessage({ type: 'success', text: `Successfully deposited ${amountNum} ${currency}` });
      setAmount('');
      
      setTimeout(() => {
        onSuccess();
        setMessage(null);
      }, 2000);
    } catch (err: any) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.error || 'Failed to deposit' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="receive-payment">
      <h3>📥 Receive Payment (Deposit)</h3>
      
      <form onSubmit={handleDeposit}>
        <div className="form-group">
          <label>Currency</label>
          <select 
            value={currency} 
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="form-control"
          >
            <option value="BTC">Bitcoin (BTC)</option>
            <option value="ETH">Ethereum (ETH)</option>
            <option value="USDT">Tether (USDT)</option>
            <option value="PAYPAL">PayPal</option>
          </select>
        </div>

        <div className="form-group">
          <label>Amount</label>
          <input
            type="number"
            step="0.00000001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="form-control"
            required
          />
        </div>

        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <button 
          type="submit" 
          className="btn-submit"
          disabled={loading}
        >
          {loading ? 'Processing...' : '💰 Deposit Funds'}
        </button>
      </form>

      <div className="info-box">
        <p>ℹ️ This is a simulation for testing. In production, you would:</p>
        <ul>
          <li>Generate a unique wallet address</li>
          <li>Wait for blockchain confirmation</li>
          <li>Credit funds after verification</li>
        </ul>
      </div>
    </div>
  );
};
