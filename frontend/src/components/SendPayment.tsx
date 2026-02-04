import { useState } from 'react';
import { Currency } from '../types';
import { api } from '../services/api';
import './SendPayment.css';

interface SendPaymentProps {
  userId: string;
  onSuccess: () => void;
}

export const SendPayment: React.FC<SendPaymentProps> = ({ userId, onSuccess }) => {
  const [currency, setCurrency] = useState<Currency>('BTC');
  const [amount, setAmount] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !recipientId) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
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
      
      await api.sendPayment(userId, currency, amountNum, recipientId);
      
      setMessage({ type: 'success', text: `Successfully sent ${amountNum} ${currency}` });
      setAmount('');
      setRecipientId('');
      
      // Call success callback to refresh wallet
      setTimeout(() => {
        onSuccess();
        setMessage(null);
      }, 2000);
    } catch (err: any) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.error || 'Failed to send payment' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="send-payment">
      <h3>📤 Send Payment</h3>
      
      <form onSubmit={handleSubmit}>
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

        <div className="form-group">
          <label>Recipient ID</label>
          <input
            type="text"
            value={recipientId}
            onChange={(e) => setRecipientId(e.target.value)}
            placeholder="Enter recipient user ID"
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
          {loading ? 'Sending...' : '💸 Send Payment'}
        </button>
      </form>
    </div>
  );
};
