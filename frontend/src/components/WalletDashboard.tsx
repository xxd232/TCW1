import { useState, useEffect } from 'react';
import { Wallet, Currency } from '../types';
import { api } from '../services/api';
import './WalletDashboard.css';

interface WalletDashboardProps {
  userId: string;
}

export const WalletDashboard: React.FC<WalletDashboardProps> = ({ userId }) => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prices, setPrices] = useState({ BTC: 0, ETH: 0, USDT: 0, currency: 'USD' });

  useEffect(() => {
    loadWalletData();
    loadPrices();
  }, [userId]);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      const data = await api.getBalance(userId);
      setWallet(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load wallet');
    } finally {
      setLoading(false);
    }
  };

  const loadPrices = async () => {
    try {
      const data = await api.getCryptoPrices();
      setPrices(data);
    } catch (err) {
      console.error('Failed to load prices:', err);
    }
  };

  const formatBalance = (amount: number, currency: Currency) => {
    if (currency === 'BTC') {
      return amount.toFixed(8);
    } else if (currency === 'ETH') {
      return amount.toFixed(6);
    } else if (currency === 'USDT') {
      return amount.toFixed(2);
    } else {
      return amount.toFixed(2);
    }
  };

  const getUSDValue = (amount: number, currency: Currency): string => {
    if (currency === 'PAYPAL' || currency === 'USD') return amount.toFixed(2);
    const price = prices[currency as keyof typeof prices];
    if (typeof price === 'number') {
      return (amount * price).toFixed(2);
    }
    return '0.00';
  };

  if (loading) {
    return <div className="loading">Loading wallet...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!wallet) {
    return <div className="error">Wallet not found</div>;
  }

  return (
    <div className="wallet-dashboard">
      <div className="wallet-header">
        <h2>💰 My Wallet</h2>
        <p className="user-id">User ID: {userId}</p>
      </div>

      <div className="balances-grid">
        {(['USD', 'BTC', 'ETH', 'USDT', 'PAYPAL'] as Currency[]).map((currency) => (
          <div key={currency} className="balance-card">
            <div className="currency-icon">
              {currency === 'USD' && '💵'}
              {currency === 'BTC' && '₿'}
              {currency === 'ETH' && 'Ξ'}
              {currency === 'USDT' && '₮'}
              {currency === 'PAYPAL' && '💳'}
            </div>
            <div className="balance-info">
              <h3>{currency}</h3>
              <p className="balance-amount">
                {formatBalance(wallet.balances[currency], currency)}
              </p>
              {currency !== 'USD' && (
                <p className="usd-value">
                  ≈ ${getUSDValue(wallet.balances[currency], currency)} USD
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="actions">
        <button className="btn-refresh" onClick={loadWalletData}>
          🔄 Refresh
        </button>
      </div>
    </div>
  );
};
