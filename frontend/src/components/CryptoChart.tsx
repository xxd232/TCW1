import React, { useEffect, useState } from 'react';
import '../styles/CryptoChart.css';

interface CryptoPriceData {
  symbol: string;
  price: number;
  change24h: number;
  change7d: number;
  name: string;
  icon: string;
}

const CryptoChart: React.FC = () => {
  const [cryptoData, setCryptoData] = useState<CryptoPriceData[]>([
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      price: 45230,
      change24h: 2.5,
      change7d: 8.3,
      icon: '₿',
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      price: 2840,
      change24h: 1.8,
      change7d: 5.2,
      icon: 'Ξ',
    },
    {
      symbol: 'USDT',
      name: 'Tether',
      price: 1.0,
      change24h: 0.1,
      change7d: 0.2,
      icon: '₮',
    },
  ]);

  const [animatingIndex, setAnimatingIndex] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCryptoData(prev =>
        prev.map(crypto => ({
          ...crypto,
          price: crypto.price * (0.98 + Math.random() * 0.04),
          change24h: crypto.change24h + (Math.random() - 0.5) * 0.5,
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handlePriceClick = (index: number) => {
    setAnimatingIndex(index);
    setTimeout(() => setAnimatingIndex(null), 600);
  };

  const generateSparkline = (): string => {
    const points: number[] = [];
    for (let i = 0; i < 20; i++) {
      points.push(Math.random() * 100);
    }
    const pathString = points
      .map((y, i) => `${(i / points.length) * 100},${100 - y}`)
      .join(' L ');
    return pathString;
  };

  return (
    <div className="crypto-chart-container">
      <div className="chart-header">
        <h2 className="chart-title">💹 Market Overview</h2>
        <p className="chart-subtitle">Real-time cryptocurrency prices</p>
      </div>

      <div className="crypto-grid">
        {cryptoData.map((crypto, index) => (
          <div
            key={crypto.symbol}
            className={`crypto-card ${animatingIndex === index ? 'animate-pulse' : ''}`}
            onClick={() => handlePriceClick(index)}
          >
            <div className="card-header">
              <div className="crypto-icon-circle">
                <span className="crypto-icon">{crypto.icon}</span>
              </div>
              <div className="crypto-info">
                <h3 className="crypto-name">{crypto.name}</h3>
                <p className="crypto-symbol">{crypto.symbol}</p>
              </div>
              <div className={`price-change ${crypto.change24h >= 0 ? 'positive' : 'negative'}`}>
                <span>
                  {crypto.change24h >= 0 ? '📈' : '📉'} {Math.abs(crypto.change24h).toFixed(2)}%
                </span>
              </div>
            </div>

            <div className="card-body">
              <div className="price-section">
                <p className="price-label">Current Price</p>
                <h2 className="price-value">
                  ${crypto.price.toFixed(2)}
                </h2>
              </div>

              <svg className="sparkline" viewBox="0 0 100 40" preserveAspectRatio="none">
                <polyline
                  points={generateSparkline()}
                  fill="none"
                  stroke={crypto.change24h >= 0 ? '#00FF00' : '#FF4444'}
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>

              <div className="stats-row">
                <div className="stat">
                  <span className="stat-label">24h Change</span>
                  <span className={`stat-value ${crypto.change24h >= 0 ? 'green' : 'red'}`}>
                    {crypto.change24h >= 0 ? '+' : ''}{crypto.change24h.toFixed(2)}%
                  </span>
                </div>
                <div className="stat">
                  <span className="stat-label">7d Change</span>
                  <span className={`stat-value ${crypto.change7d >= 0 ? 'green' : 'red'}`}>
                    {crypto.change7d >= 0 ? '+' : ''}{crypto.change7d.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="card-footer">
              <button className="buy-btn">Buy {crypto.symbol}</button>
              <button className="info-btn">Details</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CryptoChart;
