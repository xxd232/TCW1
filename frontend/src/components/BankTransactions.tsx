import { useState, useEffect } from 'react';
import { BankTransaction } from '../types';
import { api } from '../services/api';
import './BankTransactions.css';

interface BankTransactionsProps {
  userId: string;
}

export const BankTransactions: React.FC<BankTransactionsProps> = ({ userId }) => {
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadTransactions();
    
    // Auto-refresh every 5 seconds if enabled
    if (autoRefresh) {
      const interval = setInterval(loadTransactions, 5000);
      return () => clearInterval(interval);
    }
  }, [userId, autoRefresh]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await api.getBankTransactions(userId, 50);
      setTransactions(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'processing':
        return 'status-processing';
      case 'pending':
        return 'status-pending';
      case 'failed':
      case 'cancelled':
        return 'status-failed';
      default:
        return '';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading && transactions.length === 0) {
    return <div className="bank-transactions-loading">Loading transactions...</div>;
  }

  return (
    <div className="bank-transactions-container">
      <div className="transactions-header">
        <h2>Bank Transfer History</h2>
        <label className="auto-refresh-toggle">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
          />
          <span>Auto-refresh</span>
        </label>
      </div>

      {error && <div className="error-message">{error}</div>}

      {transactions.length === 0 ? (
        <div className="no-transactions">
          <p>No bank transactions yet.</p>
        </div>
      ) : (
        <div className="transactions-list">
          {transactions.map((tx) => (
            <div key={tx.id} className="transaction-card">
              <div className="transaction-icon">
                {tx.type === 'deposit' ? (
                  <span className="icon-deposit">⬇</span>
                ) : (
                  <span className="icon-withdrawal">⬆</span>
                )}
              </div>
              
              <div className="transaction-details">
                <div className="transaction-main">
                  <h3>
                    {tx.type === 'deposit' ? 'Deposit' : 'Withdrawal'} - {tx.transferType}
                  </h3>
                  <p className="transaction-amount">
                    ${tx.amount.toFixed(2)}
                  </p>
                </div>
                
                {tx.description && (
                  <p className="transaction-description">{tx.description}</p>
                )}
                
                <div className="transaction-meta">
                  <span className={`transaction-status ${getStatusClass(tx.status)}`}>
                    {tx.status.toUpperCase()}
                  </span>
                  <span className="transaction-date">{formatDate(tx.timestamp)}</span>
                </div>

                {tx.status === 'completed' && tx.completedAt && (
                  <p className="completion-time">
                    Completed: {formatDate(tx.completedAt)}
                  </p>
                )}

                {tx.status === 'failed' && tx.failureReason && (
                  <p className="failure-reason">
                    Reason: {tx.failureReason}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
