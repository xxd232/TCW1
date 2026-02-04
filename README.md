# TCW1 - Interactive Payment Wallet

A full-stack interactive web application for managing cryptocurrency and PayPal payments with wallet functionality.

## Features

### 💰 Multi-Currency Wallet
- **Bitcoin (BTC)** - Support for Bitcoin transactions
- **Ethereum (ETH)** - Ethereum blockchain integration
- **USDT** - Tether stablecoin support
- **PayPal** - Traditional payment gateway integration

### 🔄 Payment Functionality
- **Send Payments** - Transfer funds to other users
- **Receive Payments** - Deposit funds to your wallet
- **Transaction History** - View all past transactions
- **Real-time Balance** - Check current balances across all currencies

### 🎨 User Interface
- Modern, responsive design
- Real-time balance updates
- Transaction status tracking
- Multi-user simulation for testing

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type-safe development
- **bitcoinjs-lib** - Bitcoin functionality
- **ethers.js** - Ethereum integration
- **Axios** - HTTP client for PayPal API

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **CSS3** - Modern styling with gradients

## Project Structure

```
TCW1/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── index.ts        # Express server
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── types/          # TypeScript types
│   ├── package.json
│   └── tsconfig.json
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API client
│   │   ├── types/          # TypeScript types
│   │   ├── App.tsx         # Main app component
│   │   └── main.tsx        # Entry point
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## Installation

### Prerequisites
- Node.js 18+ and npm

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file (optional, defaults work for demo):
```bash
cp .env.example .env
```

Start the backend server:
```bash
npm run dev
```

The API will be available at `http://localhost:3001`

### Frontend Setup

```bash
cd frontend
npm install
```

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## API Endpoints

### Wallet Endpoints
- `GET /api/wallet/:userId/balance` - Get wallet balance
- `GET /api/wallet/:userId/transactions` - Get transaction history
- `POST /api/wallet/:userId/deposit` - Deposit funds
- `POST /api/wallet/send` - Send payment
- `GET /api/wallet/address/:type` - Generate crypto address
- `GET /api/wallet/crypto/prices` - Get current crypto prices

### PayPal Endpoints
- `POST /api/paypal/create` - Create PayPal payment
- `POST /api/paypal/verify/:paymentId` - Verify PayPal payment

## Usage

1. **Select a User** - Choose from the dropdown (user-001, user-002, user-003)
2. **Deposit Funds** - Use the "Receive Payment" section to add funds
3. **Send Payment** - Transfer funds to another user ID
4. **View Balance** - See your current balance for all currencies
5. **Check History** - Review all your transactions

## Features Demo

### Wallet Dashboard
- View balances for BTC, ETH, USDT, and PayPal
- See USD equivalent values
- Beautiful gradient cards for each currency

### Send Payment
- Select currency (BTC/ETH/USDT/PayPal)
- Enter amount and recipient ID
- Instant transaction processing
- Transaction hash generation for crypto

### Receive Payment (Deposit)
- Simulate receiving funds
- Choose currency and amount
- Instant balance update

### Transaction History
- Complete list of all transactions
- Send/receive indicators
- Status badges (completed/pending/failed)
- Timestamp and transaction details

## Security Notes

⚠️ **This is a demonstration application**

For production use, implement:
- User authentication (JWT, OAuth)
- Database persistence (PostgreSQL, MongoDB)
- Real cryptocurrency wallet integration
- PayPal live API credentials
- Rate limiting and request validation
- HTTPS/TLS encryption
- Input sanitization
- Environment variable security
- Transaction verification
- Blockchain confirmations

## Development

### Building for Production

Backend:
```bash
cd backend
npm run build
npm start
```

Frontend:
```bash
cd frontend
npm run build
npm run preview
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on the GitHub repository.
