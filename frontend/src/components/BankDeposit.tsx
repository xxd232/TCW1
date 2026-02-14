import { useState, useEffect } from 'react';
import { BankAccount } from '../types';
import { api } from '../services/api';
import './BankTransfer.css';

interface BankDepositProps {
  userId: string;
  onSuccess?: () => void;
}

export const BankDeposit: React.FC<BankDepositProps> = ({ userId, onSuccess }) => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [transferType, setTransferType] = useState<'ACH' | 'WIRE'>('ACH');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadAccounts();
  }, [userId]);

  const loadAccounts = async () => {
    try {
      const data = await api.getBankAccounts(userId);
      const verifiedAccounts = data.filter(acc => acc.isVerified);
      setAccounts(verifiedAccounts);
      if (verifiedAccounts.length > 0) {
        const primary = verifiedAccounts.find(acc => acc.isPrimary) || verifiedAccounts[0];
        setSelectedAccount(primary.id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load bank accounts');
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!selectedAccount) {
      setError('Please select a bank account');
      return;
    }

    try {
      setLoading(true);
      const result = await api.depositFromBank(userId, selectedAccount, depositAmount, transferType);
      setSuccess(result.message);
      setAmount('');
      
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1000);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to initiate deposit');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedAccountInfo = () => {
    return accounts.find(acc => acc.id === selectedAccount);
  };

  const selectedAccountInfo = getSelectedAccountInfo();

  return (
    <div className="bank-transfer-container">
      <h2>Deposit from Bank</h2>
      <p className="transfer-description">
        Transfer funds from your linked bank account to your wallet
      </p>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {accounts.length === 0 ? (
        <div className="no-accounts-message">
          <p>No verified bank accounts found.</p>
          <p>Please link and verify a bank account first.</p>
        </div>
      ) : (
        <form onSubmit={handleDeposit} className="transfer-form">
          <div className="form-group">
            <label>Select Bank Account</label>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              required
            >
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.bankName} - {account.accountType} ({account.accountNumber})
                  {account.isPrimary ? ' - Primary' : ''}
                </option>
              ))}
            </select>
          </div>

          {selectedAccountInfo && (
            <div className="account-info-box">
              <p><strong>Bank:</strong> {selectedAccountInfo.bankName}</p>
              <p><strong>Account:</strong> {selectedAccountInfo.accountNumber}</p>
              <p><strong>Type:</strong> {selectedAccountInfo.accountType}</p>
            </div>
          )}

          <div className="form-group">
            <label>Transfer Type</label>
            <div className="transfer-type-selector">
              <label className="radio-option">
                <input
                  type="radio"
                  value="ACH"
                  checked={transferType === 'ACH'}
                  onChange={(e) => setTransferType(e.target.value as 'ACH')}
                />
                <span>ACH Transfer (3-5 business days)</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  value="WIRE"
                  checked={transferType === 'WIRE'}
                  onChange={(e) => setTransferType(e.target.value as 'WIRE')}
                />
                <span>Wire Transfer (Same day)</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Amount (USD)</label>
            <div className="amount-input">
              <span className="currency-symbol">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0.01"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Processing...' : `Deposit $${amount || '0.00'} via ${transferType}`}
          </button>

          <div className="transfer-info">
            <p className="info-text">
              ℹ️ {transferType === 'ACH' ? 
                'ACH transfers typically take 3-5 business days to complete.' :
                'Wire transfers are usually completed the same business day.'}
            </p>
          </div>
        </form>
      )}
    </div>
  );
};
