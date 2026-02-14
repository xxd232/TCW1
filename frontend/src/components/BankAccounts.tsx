import { useState, useEffect } from 'react';
import { BankAccount } from '../types';
import { api } from '../services/api';
import './BankAccounts.css';

interface BankAccountsProps {
  userId: string;
  onAccountSelect?: (accountId: string) => void;
}

export const BankAccounts: React.FC<BankAccountsProps> = ({ userId, onAccountSelect }) => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    accountNumber: '',
    routingNumber: '',
    accountType: 'checking' as 'checking' | 'savings',
    bankName: '',
    accountHolderName: ''
  });

  useEffect(() => {
    loadAccounts();
  }, [userId]);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const data = await api.getBankAccounts(userId);
      setAccounts(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load bank accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.linkBankAccount(userId, formData);
      setShowAddForm(false);
      setFormData({
        accountNumber: '',
        routingNumber: '',
        accountType: 'checking',
        bankName: '',
        accountHolderName: ''
      });
      loadAccounts();
    } catch (err: any) {
      setError(err.message || 'Failed to add bank account');
    }
  };

  const handleRemoveAccount = async (accountId: string) => {
    if (!confirm('Are you sure you want to remove this bank account?')) {
      return;
    }
    try {
      await api.removeBankAccount(userId, accountId);
      loadAccounts();
    } catch (err: any) {
      setError(err.message || 'Failed to remove bank account');
    }
  };

  const handleSetPrimary = async (accountId: string) => {
    try {
      await api.setPrimaryBankAccount(userId, accountId);
      loadAccounts();
    } catch (err: any) {
      setError(err.message || 'Failed to set primary account');
    }
  };

  const handleVerify = async (accountId: string) => {
    try {
      await api.verifyBankAccount(userId, accountId);
      loadAccounts();
    } catch (err: any) {
      setError(err.message || 'Failed to verify account');
    }
  };

  if (loading) {
    return <div className="bank-accounts-loading">Loading bank accounts...</div>;
  }

  return (
    <div className="bank-accounts-container">
      <div className="bank-accounts-header">
        <h2>Linked Bank Accounts</h2>
        <button onClick={() => setShowAddForm(!showAddForm)} className="btn-add-account">
          {showAddForm ? 'Cancel' : '+ Add Bank Account'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showAddForm && (
        <form onSubmit={handleAddAccount} className="add-account-form">
          <h3>Link New Bank Account</h3>
          <div className="form-group">
            <label>Bank Name</label>
            <input
              type="text"
              value={formData.bankName}
              onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              required
              placeholder="e.g., Chase, Bank of America"
            />
          </div>
          <div className="form-group">
            <label>Account Holder Name</label>
            <input
              type="text"
              value={formData.accountHolderName}
              onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
              required
              placeholder="Full name on account"
            />
          </div>
          <div className="form-group">
            <label>Account Number</label>
            <input
              type="text"
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
              required
              placeholder="Account number"
            />
          </div>
          <div className="form-group">
            <label>Routing Number</label>
            <input
              type="text"
              value={formData.routingNumber}
              onChange={(e) => setFormData({ ...formData, routingNumber: e.target.value })}
              required
              placeholder="9-digit routing number"
              maxLength={9}
            />
          </div>
          <div className="form-group">
            <label>Account Type</label>
            <select
              value={formData.accountType}
              onChange={(e) => setFormData({ ...formData, accountType: e.target.value as 'checking' | 'savings' })}
            >
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
            </select>
          </div>
          <button type="submit" className="btn-submit">Link Account</button>
        </form>
      )}

      <div className="accounts-list">
        {accounts.length === 0 ? (
          <div className="no-accounts">
            <p>No bank accounts linked yet.</p>
            <p>Link a bank account to deposit or withdraw funds.</p>
          </div>
        ) : (
          accounts.map((account) => (
            <div key={account.id} className={`account-card ${account.isPrimary ? 'primary' : ''}`}>
              <div className="account-info">
                <div className="account-bank">
                  <h3>{account.bankName}</h3>
                  {account.isPrimary && <span className="badge-primary">Primary</span>}
                  {account.isVerified ? (
                    <span className="badge-verified">✓ Verified</span>
                  ) : (
                    <span className="badge-unverified">Not Verified</span>
                  )}
                </div>
                <div className="account-details">
                  <p><strong>{account.accountType === 'checking' ? 'Checking' : 'Savings'}</strong></p>
                  <p>Account: {account.accountNumber}</p>
                  <p>Routing: {account.routingNumber}</p>
                  <p>Holder: {account.accountHolderName}</p>
                </div>
                {account.lastUsed && (
                  <p className="last-used">Last used: {new Date(account.lastUsed).toLocaleDateString()}</p>
                )}
              </div>
              <div className="account-actions">
                {!account.isVerified && (
                  <button onClick={() => handleVerify(account.id)} className="btn-action btn-verify">
                    Verify
                  </button>
                )}
                {!account.isPrimary && account.isVerified && (
                  <button onClick={() => handleSetPrimary(account.id)} className="btn-action btn-primary">
                    Set as Primary
                  </button>
                )}
                {onAccountSelect && account.isVerified && (
                  <button onClick={() => onAccountSelect(account.id)} className="btn-action btn-select">
                    Select
                  </button>
                )}
                <button onClick={() => handleRemoveAccount(account.id)} className="btn-action btn-remove">
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
