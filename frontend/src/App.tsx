import { useState } from 'react';
import { WalletDashboard } from './components/WalletDashboard';
import { SendPayment } from './components/SendPayment';
import { ReceivePayment } from './components/ReceivePayment';
import { TransactionHistory } from './components/TransactionHistory';
import './App.css';

function App() {
  const [userId, setUserId] = useState('user-001');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTransactionSuccess = () => {
    // Trigger refresh of wallet and transactions
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🌐 TCW1 Payment Wallet</h1>
        <p className="tagline">Send and receive Bitcoin, USDT, Ethereum & PayPal</p>
      </header>

      <div className="user-selector">
        <label>Select User:</label>
        <select value={userId} onChange={(e) => setUserId(e.target.value)}>
          <option value="user-001">User 001</option>
          <option value="user-002">User 002</option>
          <option value="user-003">User 003</option>
        </select>
      </div>

      <main className="app-main">
        <WalletDashboard userId={userId} key={refreshKey} />
        
        <div className="payment-section">
          <ReceivePayment userId={userId} onSuccess={handleTransactionSuccess} />
          <SendPayment userId={userId} onSuccess={handleTransactionSuccess} />
        </div>

        <TransactionHistory userId={userId} refresh={refreshKey} />
      </main>

      <footer className="app-footer">
        <p>© 2024 TCW1 - Interactive Payment Wallet</p>
        <p className="disclaimer">
          Demo application - Not for production use. Cryptocurrency transactions are simulated.
        </p>
      </footer>
    </div>
  );
}

export default App;
