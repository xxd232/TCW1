// --- Manual Form ---
const ManualForm = ({ userId, type, onResult, loading, setLoading, onClose }: any) => {
  const [reference, setReference] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [success, setSuccess] = useState(false);
  useEffect(() => { if (success) setTimeout(onClose, 1200); }, [success]);
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true); onResult(null);
    try {
      // Simulate backend submission
      await new Promise(res => setTimeout(res, 1200));
      onResult((type === 'deposit' ? 'Deposit' : 'Withdrawal') + ' request submitted for manual review!');
      setSuccess(true);
    } catch (e: any) {
      onResult('Submission failed: ' + (e?.message || 'Unknown error'));
    } finally { setLoading(false); }
  };
  return (
    <form className="deposit-form" onSubmit={handleSubmit}>
      <h4>{type === 'deposit' ? 'Manual Deposit' : 'Manual Withdrawal'}</h4>
      <div style={{fontSize:'0.95rem',marginBottom:8}}>Please follow the instructions below and upload proof or enter a reference number. Our team will review and approve your request.</div>
      <input type="text" placeholder="Reference Number" className="deposit-input" value={reference} onChange={e => setReference(e.target.value)} disabled={loading} />
      <input type="file" className="deposit-input" onChange={e => setFile(e.target.files?.[0] || null)} disabled={loading} />
      <button className="btn-action" type="submit" disabled={loading || (!reference && !file)}>{loading ? 'Submitting...' : 'Submit'}</button>
    </form>
  );
};

// --- Deposit Forms ---
const DepositCardForm = ({ userId, onResult, loading, setLoading, onClose }: any) => {
  const [amount, setAmount] = useState('');
  const [success, setSuccess] = useState(false);
  useEffect(() => { if (success) setTimeout(onClose, 1200); }, [success]);
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true); onResult(null);
    try {
      await api.deposit(userId, 'USD', Number(amount));
      onResult('Deposit successful!'); setSuccess(true);
    } catch (e: any) {
      onResult('Deposit failed: ' + (e?.response?.data?.error || e.message));
    } finally { setLoading(false); }
  };
  return (
    <form className="deposit-form" onSubmit={handleSubmit}>
      <h4>Deposit via Card</h4>
      <input type="text" placeholder="Card Number" className="deposit-input" disabled={loading} />
      <input type="text" placeholder="Expiry (MM/YY)" className="deposit-input" disabled={loading} />
      <input type="text" placeholder="CVV" className="deposit-input" disabled={loading} />
      <input type="number" placeholder="Amount" className="deposit-input" value={amount} onChange={e => setAmount(e.target.value)} disabled={loading} />
      <button className="btn-action" type="submit" disabled={loading || !amount}>{loading ? 'Processing...' : 'Deposit'}</button>
    </form>
  );
};

const DepositPayPalForm = ({ userId, onResult, loading, setLoading, onClose }: any) => {
  const [amount, setAmount] = useState('');
  const [success, setSuccess] = useState(false);
  useEffect(() => { if (success) setTimeout(onClose, 1200); }, [success]);
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true); onResult(null);
    try {
      await api.deposit(userId, 'PAYPAL', Number(amount));
      onResult('Deposit successful!'); setSuccess(true);
    } catch (e: any) {
      onResult('Deposit failed: ' + (e?.response?.data?.error || e.message));
    } finally { setLoading(false); }
  };
  return (
    <form className="deposit-form" onSubmit={handleSubmit}>
      <h4>Deposit via PayPal</h4>
      <input type="email" placeholder="PayPal Email" className="deposit-input" disabled={loading} />
      <input type="number" placeholder="Amount" className="deposit-input" value={amount} onChange={e => setAmount(e.target.value)} disabled={loading} />
      <button className="btn-action" type="submit" disabled={loading || !amount}>{loading ? 'Processing...' : 'Deposit'}</button>
    </form>
  );
};

const DepositACHForm = ({ userId, onResult, loading, setLoading, onClose }: any) => {
  const [amount, setAmount] = useState('');
  const [success, setSuccess] = useState(false);
  const bankAccountId = 'demo-bank';
  useEffect(() => { if (success) setTimeout(onClose, 1200); }, [success]);
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true); onResult(null);
    try {
      await api.depositFromBank(userId, bankAccountId, Number(amount), 'ACH');
      onResult('Deposit successful!'); setSuccess(true);
    } catch (e: any) {
      onResult('Deposit failed: ' + (e?.response?.data?.error || e.message));
    } finally { setLoading(false); }
  };
  return (
    <form className="deposit-form" onSubmit={handleSubmit}>
      <h4>Deposit via Plaid/ACH</h4>
      <input type="text" placeholder="Routing Number" className="deposit-input" disabled={loading} />
      <input type="text" placeholder="Account Number" className="deposit-input" disabled={loading} />
      <input type="number" placeholder="Amount" className="deposit-input" value={amount} onChange={e => setAmount(e.target.value)} disabled={loading} />
      <button className="btn-action" type="submit" disabled={loading || !amount}>{loading ? 'Processing...' : 'Deposit'}</button>
    </form>
  );
};

const DepositCryptoForm = ({ userId, onResult, loading, setLoading, onClose }: any) => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'BTC' | 'ETH' | 'USDT'>('BTC');
  const [success, setSuccess] = useState(false);
  useEffect(() => { if (success) setTimeout(onClose, 1200); }, [success]);
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true); onResult(null);
    try {
      await api.deposit(userId, currency, Number(amount));
      onResult('Deposit successful!'); setSuccess(true);
    } catch (e: any) {
      onResult('Deposit failed: ' + (e?.response?.data?.error || e.message));
    } finally { setLoading(false); }
  };
  return (
    <form className="deposit-form" onSubmit={handleSubmit}>
      <h4>Deposit via Crypto</h4>
      <select className="deposit-input" value={currency} onChange={e => setCurrency(e.target.value as any)} disabled={loading}>
        <option value="BTC">BTC</option>
        <option value="ETH">ETH</option>
        <option value="USDT">USDT</option>
      </select>
      <input type="text" placeholder="Crypto Address" className="deposit-input" disabled={loading} />
      <input type="number" placeholder="Amount" className="deposit-input" value={amount} onChange={e => setAmount(e.target.value)} disabled={loading} />
      <button className="btn-action" type="submit" disabled={loading || !amount}>{loading ? 'Processing...' : 'Deposit'}</button>
    </form>
  );
};

// --- Withdraw Forms ---
const WithdrawCardForm = ({ userId, onResult, loading, setLoading, onClose }: any) => {
  const [amount, setAmount] = useState('');
  const [success, setSuccess] = useState(false);
  useEffect(() => { if (success) setTimeout(onClose, 1200); }, [success]);
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true); onResult(null);
    try {
      await api.withdrawToBank(userId, 'demo-card', Number(amount), 'ACH');
      onResult('Withdrawal successful!'); setSuccess(true);
    } catch (e: any) {
      onResult('Withdrawal failed: ' + (e?.response?.data?.error || e.message));
    } finally { setLoading(false); }
  };
  return (
    <form className="deposit-form" onSubmit={handleSubmit}>
      <h4>Withdraw to Card</h4>
      <input type="text" placeholder="Card Number" className="deposit-input" disabled={loading} />
      <input type="number" placeholder="Amount" className="deposit-input" value={amount} onChange={e => setAmount(e.target.value)} disabled={loading} />
      <button className="btn-action" type="submit" disabled={loading || !amount}>{loading ? 'Processing...' : 'Withdraw'}</button>
    </form>
  );
};

const WithdrawPayPalForm = ({ userId, onResult, loading, setLoading, onClose }: any) => {
  const [amount, setAmount] = useState('');
  const [success, setSuccess] = useState(false);
  useEffect(() => { if (success) setTimeout(onClose, 1200); }, [success]);
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true); onResult(null);
    try {
      await api.withdrawToBank(userId, 'demo-paypal', Number(amount), 'ACH');
      onResult('Withdrawal successful!'); setSuccess(true);
    } catch (e: any) {
      onResult('Withdrawal failed: ' + (e?.response?.data?.error || e.message));
    } finally { setLoading(false); }
  };
  return (
    <form className="deposit-form" onSubmit={handleSubmit}>
      <h4>Withdraw to PayPal</h4>
      <input type="email" placeholder="PayPal Email" className="deposit-input" disabled={loading} />
      <input type="number" placeholder="Amount" className="deposit-input" value={amount} onChange={e => setAmount(e.target.value)} disabled={loading} />
      <button className="btn-action" type="submit" disabled={loading || !amount}>{loading ? 'Processing...' : 'Withdraw'}</button>
    </form>
  );
};

const WithdrawACHForm = ({ userId, onResult, loading, setLoading, onClose }: any) => {
  const [amount, setAmount] = useState('');
  const [success, setSuccess] = useState(false);
  useEffect(() => { if (success) setTimeout(onClose, 1200); }, [success]);
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true); onResult(null);
    try {
      await api.withdrawToBank(userId, 'demo-ach', Number(amount), 'ACH');
      onResult('Withdrawal successful!'); setSuccess(true);
    } catch (e: any) {
      onResult('Withdrawal failed: ' + (e?.response?.data?.error || e.message));
    } finally { setLoading(false); }
  };
  return (
    <form className="deposit-form" onSubmit={handleSubmit}>
      <h4>Withdraw via Plaid/ACH</h4>
      <input type="text" placeholder="Routing Number" className="deposit-input" disabled={loading} />
      <input type="text" placeholder="Account Number" className="deposit-input" disabled={loading} />
      <input type="number" placeholder="Amount" className="deposit-input" value={amount} onChange={e => setAmount(e.target.value)} disabled={loading} />
      <button className="btn-action" type="submit" disabled={loading || !amount}>{loading ? 'Processing...' : 'Withdraw'}</button>
    </form>
  );
};

const WithdrawCryptoForm = ({ userId, onResult, loading, setLoading, onClose }: any) => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'BTC' | 'ETH' | 'USDT'>('BTC');
  const [success, setSuccess] = useState(false);
  useEffect(() => { if (success) setTimeout(onClose, 1200); }, [success]);
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true); onResult(null);
    try {
      await api.withdrawToBank(userId, 'demo-crypto', Number(amount), 'ACH');
      onResult('Withdrawal successful!'); setSuccess(true);
    } catch (e: any) {
      onResult('Withdrawal failed: ' + (e?.response?.data?.error || e.message));
    } finally { setLoading(false); }
  };
  return (
    <form className="deposit-form" onSubmit={handleSubmit}>
      <h4>Withdraw via Crypto</h4>
      <select className="deposit-input" value={currency} onChange={e => setCurrency(e.target.value as any)} disabled={loading}>
        <option value="BTC">BTC</option>
        <option value="ETH">ETH</option>
        <option value="USDT">USDT</option>
      </select>
      <input type="text" placeholder="Crypto Address" className="deposit-input" disabled={loading} />
      <input type="number" placeholder="Amount" className="deposit-input" value={amount} onChange={e => setAmount(e.target.value)} disabled={loading} />
      <button className="btn-action" type="submit" disabled={loading || !amount}>{loading ? 'Processing...' : 'Withdraw'}</button>
    </form>
  );
};
import { useState, useEffect, FormEvent } from 'react';
import Modal from './Modal';
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
  const [modal, setModal] = useState<null | 'send' | 'receive' | 'deposit' | 'withdraw' | 'add-card' | 'virtual-card' | 'add-bank' | 'statements' | 'deposit-card' | 'deposit-paypal' | 'deposit-ach' | 'deposit-crypto' | 'deposit-cash' | 'deposit-google' | 'deposit-apple'>(null);
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositResult, setDepositResult] = useState<string | null>(null);

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

      <div className="actions actions-grid">
        <button className="btn-action" onClick={() => setModal('send')}>
          📤 Send
        </button>
        <button className="btn-action" onClick={() => setModal('receive')}>
          📥 Receive
        </button>
        <button className="btn-action" onClick={() => setModal('deposit')}>
          💵 Deposit
        </button>
        <button className="btn-action" onClick={() => setModal('withdraw')}>
          💸 Withdraw
        </button>
        <button className="btn-action" onClick={() => setModal('add-card')}>
          💳 Add Card
        </button>
        <button className="btn-action" onClick={() => setModal('virtual-card')}>
          🪪 Request Virtual Card
        </button>
        <button className="btn-action" onClick={() => setModal('add-bank')}>
          🏦 Add Bank
        </button>
        <button className="btn-action" onClick={() => setModal('statements')}>
          📄 Get Statements
        </button>
        <button className="btn-refresh" onClick={loadWalletData}>
          🔄 Refresh
        </button>
      </div>

      <Modal isOpen={modal !== null} title={modal ? modal.charAt(0).toUpperCase() + modal.slice(1) : ''} onClose={() => { setModal(null); setDepositResult(null); }}>
        <div className="modal-action-content">
          {modal === 'deposit' && (
            <>
              <h4 className="deposit-modal-title">Add Money via:</h4>
              <div className="deposit-options-list">
                <button className="btn-action" onClick={() => setModal('deposit-card')}>💳 Card</button>
                <button className="btn-action" onClick={() => setModal('deposit-paypal')}>🅿️ PayPal</button>
                <button className="btn-action" onClick={() => setModal('deposit-ach')}>🏦 Plaid/ACH</button>
                <button className="btn-action" onClick={() => setModal('deposit-crypto')}>🪙 Crypto</button>
                <button className="btn-action" onClick={() => setModal('deposit-cash')}>💵 Cash Deposit</button>
                <button className="btn-action" onClick={() => setModal('deposit-manual')}>📝 Manual</button>
                <button className="btn-action" onClick={() => setModal('deposit-google')}>🟢 Google Pay</button>
                <button className="btn-action" onClick={() => setModal('deposit-apple')}>🍏 Apple Pay</button>
              </div>
            </>
          )}
          {modal === 'withdraw' && (
            <>
              <h4 className="deposit-modal-title">Withdraw Money via:</h4>
              <div className="deposit-options-list">
                <button className="btn-action" onClick={() => setModal('withdraw-card')}>💳 Card</button>
                <button className="btn-action" onClick={() => setModal('withdraw-paypal')}>🅿️ PayPal</button>
                <button className="btn-action" onClick={() => setModal('withdraw-ach')}>🏦 Plaid/ACH</button>
                <button className="btn-action" onClick={() => setModal('withdraw-crypto')}>🪙 Crypto</button>
                <button className="btn-action" onClick={() => setModal('withdraw-cash')}>💵 Cash</button>
                <button className="btn-action" onClick={() => setModal('withdraw-manual')}>📝 Manual</button>
                          {modal === 'deposit-manual' && (
                            <ManualForm userId={userId} type="deposit" onResult={setDepositResult} loading={depositLoading} setLoading={setDepositLoading} onClose={() => { setModal(null); setDepositResult(null); }} />
                          )}
                          {modal === 'withdraw-manual' && (
                            <ManualForm userId={userId} type="withdraw" onResult={setDepositResult} loading={depositLoading} setLoading={setDepositLoading} onClose={() => { setModal(null); setDepositResult(null); }} />
                          )}
                // --- Manual Form ---
                const ManualForm = ({ userId, type, onResult, loading, setLoading, onClose }: any) => {
                  const [reference, setReference] = useState('');
                  const [file, setFile] = useState<File | null>(null);
                  const [success, setSuccess] = useState(false);
                  useEffect(() => { if (success) setTimeout(onClose, 1200); }, [success]);
                  const handleSubmit = async (e: FormEvent) => {
                    e.preventDefault();
                    setLoading(true); onResult(null);
                    try {
                      // Simulate backend submission
                      await new Promise(res => setTimeout(res, 1200));
                      onResult((type === 'deposit' ? 'Deposit' : 'Withdrawal') + ' request submitted for manual review!');
                      setSuccess(true);
                    } catch (e: any) {
                      onResult('Submission failed: ' + (e?.message || 'Unknown error'));
                    } finally { setLoading(false); }
                  };
                  return (
                    <form className="deposit-form" onSubmit={handleSubmit}>
                      <h4>{type === 'deposit' ? 'Manual Deposit' : 'Manual Withdrawal'}</h4>
                      <div style={{fontSize:'0.95rem',marginBottom:8}}>Please follow the instructions below and upload proof or enter a reference number. Our team will review and approve your request.</div>
                      <input type="text" placeholder="Reference Number" className="deposit-input" value={reference} onChange={e => setReference(e.target.value)} disabled={loading} />
                      <input type="file" className="deposit-input" onChange={e => setFile(e.target.files?.[0] || null)} disabled={loading} />
                      <button className="btn-action" type="submit" disabled={loading || (!reference && !file)}>{loading ? 'Submitting...' : 'Submit'}</button>
                    </form>
                  );
                };
                <button className="btn-action" onClick={() => setModal('withdraw-google')}>🟢 Google Pay</button>
                <button className="btn-action" onClick={() => setModal('withdraw-apple')}>🍏 Apple Pay</button>
              </div>
            </>
          )}
          {modal === 'withdraw-card' && (
            <WithdrawCardForm userId={userId} onResult={setDepositResult} loading={depositLoading} setLoading={setDepositLoading} onClose={() => { setModal(null); setDepositResult(null); }} />
          )}
          {modal === 'withdraw-paypal' && (
            <WithdrawPayPalForm userId={userId} onResult={setDepositResult} loading={depositLoading} setLoading={setDepositLoading} onClose={() => { setModal(null); setDepositResult(null); }} />
          )}
          {modal === 'withdraw-ach' && (
            <WithdrawACHForm userId={userId} onResult={setDepositResult} loading={depositLoading} setLoading={setDepositLoading} onClose={() => { setModal(null); setDepositResult(null); }} />
          )}
          {modal === 'withdraw-crypto' && (
            <WithdrawCryptoForm userId={userId} onResult={setDepositResult} loading={depositLoading} setLoading={setDepositLoading} onClose={() => { setModal(null); setDepositResult(null); }} />
          )}
          // --- Withdraw Forms ---
          const WithdrawCardForm = ({ userId, onResult, loading, setLoading, onClose }: any) => {
            const [amount, setAmount] = useState('');
            const [success, setSuccess] = useState(false);
            useEffect(() => { if (success) setTimeout(onClose, 1200); }, [success]);
            const handleSubmit = async (e: FormEvent) => {
              e.preventDefault();
              setLoading(true); onResult(null);
              try {
                // Simulate card withdrawal
                await api.withdrawToBank(userId, 'demo-card', Number(amount), 'ACH');
                onResult('Withdrawal successful!'); setSuccess(true);
              } catch (e: any) {
                onResult('Withdrawal failed: ' + (e?.response?.data?.error || e.message));
              } finally { setLoading(false); }
            };
            return (
              <form className="deposit-form" onSubmit={handleSubmit}>
                <h4>Withdraw to Card</h4>
                <input type="text" placeholder="Card Number" className="deposit-input" disabled={loading} />
                <input type="number" placeholder="Amount" className="deposit-input" value={amount} onChange={e => setAmount(e.target.value)} disabled={loading} />
                <button className="btn-action" type="submit" disabled={loading || !amount}>{loading ? 'Processing...' : 'Withdraw'}</button>
              </form>
            );
          };

          const WithdrawPayPalForm = ({ userId, onResult, loading, setLoading, onClose }: any) => {
            const [amount, setAmount] = useState('');
            const [success, setSuccess] = useState(false);
            useEffect(() => { if (success) setTimeout(onClose, 1200); }, [success]);
            const handleSubmit = async (e: FormEvent) => {
              e.preventDefault();
              setLoading(true); onResult(null);
              try {
                // Simulate PayPal withdrawal
                await api.withdrawToBank(userId, 'demo-paypal', Number(amount), 'ACH');
                onResult('Withdrawal successful!'); setSuccess(true);
              } catch (e: any) {
                onResult('Withdrawal failed: ' + (e?.response?.data?.error || e.message));
              } finally { setLoading(false); }
            };
            return (
              <form className="deposit-form" onSubmit={handleSubmit}>
                <h4>Withdraw to PayPal</h4>
                <input type="email" placeholder="PayPal Email" className="deposit-input" disabled={loading} />
                <input type="number" placeholder="Amount" className="deposit-input" value={amount} onChange={e => setAmount(e.target.value)} disabled={loading} />
                <button className="btn-action" type="submit" disabled={loading || !amount}>{loading ? 'Processing...' : 'Withdraw'}</button>
              </form>
            );
          };

          const WithdrawACHForm = ({ userId, onResult, loading, setLoading, onClose }: any) => {
            const [amount, setAmount] = useState('');
            const [success, setSuccess] = useState(false);
            useEffect(() => { if (success) setTimeout(onClose, 1200); }, [success]);
            const handleSubmit = async (e: FormEvent) => {
              e.preventDefault();
              setLoading(true); onResult(null);
              try {
                // Simulate ACH withdrawal
                await api.withdrawToBank(userId, 'demo-ach', Number(amount), 'ACH');
                onResult('Withdrawal successful!'); setSuccess(true);
              } catch (e: any) {
                onResult('Withdrawal failed: ' + (e?.response?.data?.error || e.message));
              } finally { setLoading(false); }
            };
            return (
              <form className="deposit-form" onSubmit={handleSubmit}>
                <h4>Withdraw via Plaid/ACH</h4>
                <input type="text" placeholder="Routing Number" className="deposit-input" disabled={loading} />
                <input type="text" placeholder="Account Number" className="deposit-input" disabled={loading} />
                <input type="number" placeholder="Amount" className="deposit-input" value={amount} onChange={e => setAmount(e.target.value)} disabled={loading} />
                <button className="btn-action" type="submit" disabled={loading || !amount}>{loading ? 'Processing...' : 'Withdraw'}</button>
              </form>
            );
          };

          const WithdrawCryptoForm = ({ userId, onResult, loading, setLoading, onClose }: any) => {
            const [amount, setAmount] = useState('');
            const [currency, setCurrency] = useState<'BTC' | 'ETH' | 'USDT'>('BTC');
            const [success, setSuccess] = useState(false);
            useEffect(() => { if (success) setTimeout(onClose, 1200); }, [success]);
            const handleSubmit = async (e: FormEvent) => {
              e.preventDefault();
              setLoading(true); onResult(null);
              try {
                // Simulate crypto withdrawal
                await api.withdrawToBank(userId, 'demo-crypto', Number(amount), 'ACH');
                onResult('Withdrawal successful!'); setSuccess(true);
              } catch (e: any) {
                onResult('Withdrawal failed: ' + (e?.response?.data?.error || e.message));
              } finally { setLoading(false); }
            };
            return (
              <form className="deposit-form" onSubmit={handleSubmit}>
                <h4>Withdraw via Crypto</h4>
                <select className="deposit-input" value={currency} onChange={e => setCurrency(e.target.value as any)} disabled={loading}>
                  <option value="BTC">BTC</option>
                  <option value="ETH">ETH</option>
                  <option value="USDT">USDT</option>
                </select>
                <input type="text" placeholder="Crypto Address" className="deposit-input" disabled={loading} />
                <input type="number" placeholder="Amount" className="deposit-input" value={amount} onChange={e => setAmount(e.target.value)} disabled={loading} />
                <button className="btn-action" type="submit" disabled={loading || !amount}>{loading ? 'Processing...' : 'Withdraw'}</button>
              </form>
            );
          };
          {modal === 'deposit-card' && (
            <DepositCardForm userId={userId} onResult={setDepositResult} loading={depositLoading} setLoading={setDepositLoading} onClose={() => { setModal(null); setDepositResult(null); }} />
          )}
          {modal === 'deposit-paypal' && (
            <DepositPayPalForm userId={userId} onResult={setDepositResult} loading={depositLoading} setLoading={setDepositLoading} onClose={() => { setModal(null); setDepositResult(null); }} />
          )}
          {modal === 'deposit-ach' && (
            <DepositACHForm userId={userId} onResult={setDepositResult} loading={depositLoading} setLoading={setDepositLoading} onClose={() => { setModal(null); setDepositResult(null); }} />
          )}
          {modal === 'deposit-crypto' && (
            <DepositCryptoForm userId={userId} onResult={setDepositResult} loading={depositLoading} setLoading={setDepositLoading} onClose={() => { setModal(null); setDepositResult(null); }} />
          )}
          {depositResult && (
            <div className={depositResult.startsWith('Deposit successful') ? 'deposit-result' : 'deposit-result deposit-error'}>
              {depositResult}
              <button className="btn-action" style={{marginTop:8}} onClick={() => { setModal(null); setDepositResult(null); }}>close</button>
            </div>
          )}
          // --- Deposit Forms ---
          const DepositCardForm = ({ userId, onResult, loading, setLoading, onClose }: any) => {
            const [amount, setAmount] = useState('');
            const [success, setSuccess] = useState(false);
            useEffect(() => { if (success) setTimeout(onClose, 1200); }, [success]);
            const handleSubmit = async (e: FormEvent) => {
              e.preventDefault();
              setLoading(true); onResult(null);
              try {
                await api.deposit(userId, 'USD', Number(amount));
                onResult('Deposit successful!'); setSuccess(true);
              } catch (e: any) {
                onResult('Deposit failed: ' + (e?.response?.data?.error || e.message));
              } finally { setLoading(false); }
            };
            return (
              <form className="deposit-form" onSubmit={handleSubmit}>
                <h4>Deposit via Card</h4>
                <input type="text" placeholder="Card Number" className="deposit-input" disabled={loading} />
                <input type="text" placeholder="Expiry (MM/YY)" className="deposit-input" disabled={loading} />
                <input type="text" placeholder="CVV" className="deposit-input" disabled={loading} />
                <input type="number" placeholder="Amount" className="deposit-input" value={amount} onChange={e => setAmount(e.target.value)} disabled={loading} />
                <button className="btn-action" type="submit" disabled={loading || !amount}>{loading ? 'Processing...' : 'Deposit'}</button>
              </form>
            );
          };

          const DepositPayPalForm = ({ userId, onResult, loading, setLoading, onClose }: any) => {
            const [amount, setAmount] = useState('');
            const [success, setSuccess] = useState(false);
            useEffect(() => { if (success) setTimeout(onClose, 1200); }, [success]);
            const handleSubmit = async (e: FormEvent) => {
              e.preventDefault();
              setLoading(true); onResult(null);
              try {
                await api.deposit(userId, 'PAYPAL', Number(amount));
                onResult('Deposit successful!'); setSuccess(true);
              } catch (e: any) {
                onResult('Deposit failed: ' + (e?.response?.data?.error || e.message));
              } finally { setLoading(false); }
            };
            return (
              <form className="deposit-form" onSubmit={handleSubmit}>
                <h4>Deposit via PayPal</h4>
                <input type="email" placeholder="PayPal Email" className="deposit-input" disabled={loading} />
                <input type="number" placeholder="Amount" className="deposit-input" value={amount} onChange={e => setAmount(e.target.value)} disabled={loading} />
                <button className="btn-action" type="submit" disabled={loading || !amount}>{loading ? 'Processing...' : 'Deposit'}</button>
              </form>
            );
          };

          const DepositACHForm = ({ userId, onResult, loading, setLoading, onClose }: any) => {
            const [amount, setAmount] = useState('');
            const [success, setSuccess] = useState(false);
            // For demo, use a fake bankAccountId
            const bankAccountId = 'demo-bank';
            useEffect(() => { if (success) setTimeout(onClose, 1200); }, [success]);
            const handleSubmit = async (e: FormEvent) => {
              e.preventDefault();
              setLoading(true); onResult(null);
              try {
                await api.depositFromBank(userId, bankAccountId, Number(amount), 'ACH');
                onResult('Deposit successful!'); setSuccess(true);
              } catch (e: any) {
                onResult('Deposit failed: ' + (e?.response?.data?.error || e.message));
              } finally { setLoading(false); }
            };
            return (
              <form className="deposit-form" onSubmit={handleSubmit}>
                <h4>Deposit via Plaid/ACH</h4>
                <input type="text" placeholder="Routing Number" className="deposit-input" disabled={loading} />
                <input type="text" placeholder="Account Number" className="deposit-input" disabled={loading} />
                <input type="number" placeholder="Amount" className="deposit-input" value={amount} onChange={e => setAmount(e.target.value)} disabled={loading} />
                <button className="btn-action" type="submit" disabled={loading || !amount}>{loading ? 'Processing...' : 'Deposit'}</button>
              </form>
            );
          };

          const DepositCryptoForm = ({ userId, onResult, loading, setLoading, onClose }: any) => {
            const [amount, setAmount] = useState('');
            const [currency, setCurrency] = useState<'BTC' | 'ETH' | 'USDT'>('BTC');
            const [success, setSuccess] = useState(false);
            useEffect(() => { if (success) setTimeout(onClose, 1200); }, [success]);
            const handleSubmit = async (e: FormEvent) => {
              e.preventDefault();
              setLoading(true); onResult(null);
              try {
                await api.deposit(userId, currency, Number(amount));
                onResult('Deposit successful!'); setSuccess(true);
              } catch (e: any) {
                onResult('Deposit failed: ' + (e?.response?.data?.error || e.message));
              } finally { setLoading(false); }
            };
            return (
              <form className="deposit-form" onSubmit={handleSubmit}>
                <h4>Deposit via Crypto</h4>
                <select className="deposit-input" value={currency} onChange={e => setCurrency(e.target.value as any)} disabled={loading}>
                  <option value="BTC">BTC</option>
                  <option value="ETH">ETH</option>
                  <option value="USDT">USDT</option>
                </select>
                <input type="text" placeholder="Crypto Address" className="deposit-input" disabled={loading} />
                <input type="number" placeholder="Amount" className="deposit-input" value={amount} onChange={e => setAmount(e.target.value)} disabled={loading} />
                <button className="btn-action" type="submit" disabled={loading || !amount}>{loading ? 'Processing...' : 'Deposit'}</button>
              </form>
            );
          };
          {modal === 'deposit-cash' && (
            <form className="deposit-form">
              <h4>Deposit via Cash</h4>
              <input type="text" placeholder="Location/Reference" className="deposit-input" />
              <input type="number" placeholder="Amount" className="deposit-input" />
              <button className="btn-action" type="submit">Deposit</button>
            </form>
          )}
          {modal === 'deposit-google' && (
            <form className="deposit-form">
              <h4>Deposit via Google Pay</h4>
              <input type="text" placeholder="Google Pay ID" className="deposit-input" />
              <input type="number" placeholder="Amount" className="deposit-input" />
              <button className="btn-action" type="submit">Deposit</button>
            </form>
          )}
          {modal === 'deposit-apple' && (
            <form className="deposit-form">
              <h4>Deposit via Apple Pay</h4>
              <input type="text" placeholder="Apple Pay ID" className="deposit-input" />
              <input type="number" placeholder="Amount" className="deposit-input" />
              <button className="btn-action" type="submit">Deposit</button>
            </form>
          )}
          {modal === 'add-card' && <p>Add a new card (coming soon)</p>}
          {modal === 'virtual-card' && <p>Request a virtual card (coming soon)</p>}
          {modal === 'add-bank' && <p>Add a new bank account (coming soon)</p>}
          {modal === 'statements' && <p>Download or view statements (coming soon)</p>}
          {['send','receive','withdraw'].includes(modal || '') && (
            <p>Action coming soon: <b>{modal}</b></p>
          )}
        </div>
      </Modal>
    </div>
  );
};
