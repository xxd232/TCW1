# TCW1 - Interactive Payment Wallet

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue.svg)

A full-stack interactive web application for managing cryptocurrency and PayPal payments with wallet functionality.

---

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [API Endpoints](#api-endpoints)
- [Usage](#usage)
- [Features Demo](#features-demo)
- [Security Notes](#security-notes)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [License](#license)
- [Contributing](#contributing)
- [Support](#support)

---

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

---

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

---

## Quick Start

### 📂 Locating Your Project

After cloning the repository, you need to navigate to the project folder. Here's how:

**Windows:**
```bash
# If you cloned to your home directory
cd C:\Users\YourUsername\TCW1

# Or if you cloned to Documents
cd C:\Users\YourUsername\Documents\TCW1
```

**macOS/Linux:**
```bash
# If you cloned to your home directory
cd ~/TCW1

# Or if you cloned to a specific location
cd /path/to/where/you/cloned/TCW1
```

> **💡 Can't find your project?**
> - Open your terminal/command prompt
> - Type `cd` and press Enter to go to your home directory
> - Type `dir` (Windows) or `ls` (macOS/Linux) to see folders
> - Look for the `TCW1` folder
> - If still can't find it, try searching for "TCW1" in your file explorer

Once you're in the project folder, you should see two main folders:
- `backend/` - Contains the server code
- `frontend/` - Contains the user interface code

### 🚀 Get up and running in 3 simple steps:

1. **Install dependencies**
   ```bash
   # Backend
   cd backend && npm install

   # Frontend (in a new terminal)
   cd frontend && npm install
   ```

2. **Start the servers**
   ```bash
   # Backend (from backend directory)
   npm run dev

   # Frontend (from frontend directory, in a new terminal)
   npm run dev
   ```

3. **Open your browser**
   - Navigate to `http://localhost:3000`
   - Select a user from the dropdown and start making transactions!

---

## Installation

### Prerequisites

Before you begin, ensure you have the following installed:
- **Git** (for cloning the repository)
- **Node.js** (version 18.0.0 or higher)
- **npm** (comes with Node.js)

You can verify your installations by running:
```bash
git --version   # Should output your Git version
node --version  # Should output v18.0.0 or higher
npm --version   # Should output a version number
```

### Getting the Project

**Step 1: Clone the repository**
```bash
# Clone to your preferred location
git clone https://github.com/xxd232/TCW1.git

# Navigate into the project folder
cd TCW1
```

**Step 2: Verify project structure**
```bash
# List the contents (you should see backend and frontend folders)
ls          # macOS/Linux
dir         # Windows
```

Expected output:
```
backend/
frontend/
README.md
.gitignore
```

### Backend Setup

**Navigate to the backend folder:**
```bash
# Make sure you're in the TCW1 project root first
cd backend
```

**Install dependencies:**
```bash
npm install
```

**Environment Configuration (Optional)**

Create a `.env` file for custom configuration:
```bash
cp .env.example .env
```

> **Note:** The application works out-of-the-box with default values. Custom environment variables are optional for demo purposes.

**Start the backend server:**
```bash
npm run dev
```

The API will be available at `http://localhost:3001`

### Frontend Setup

**Navigate to the frontend folder:**
```bash
# If you're still in the backend folder
cd ../frontend

# Or if you're in the TCW1 project root
cd frontend
```

**Install dependencies:**
```bash
npm install
```

**Start the development server:**
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

---

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

---

## Usage

1. **Select a User** - Choose from the dropdown (user-001, user-002, user-003)
2. **Deposit Funds** - Use the "Receive Payment" section to add funds
3. **Send Payment** - Transfer funds to another user ID
4. **View Balance** - See your current balance for all currencies
5. **Check History** - Review all your transactions

> **💡 Tip:** Try opening the app in multiple browser tabs or windows and select different users (e.g., user-001 in one tab, user-002 in another) to test sending payments between users in real-time!

---

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

---

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

---

## Development

### Development Mode

Both frontend and backend support hot-reloading during development:

**Backend (with auto-restart on file changes):**
```bash
cd backend
npm run watch
```

**Frontend (already includes hot-reloading):**
```bash
cd frontend
npm run dev
```

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

---

## License

MIT

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## Troubleshooting

### Can't find the project folder?

**Problem:** You cloned the repository but can't locate the `TCW1` folder on your computer.

**Solutions:**

1. **Check your current location:**
   ```bash
   # Show your current directory
   pwd                    # macOS/Linux
   cd                     # Windows (shows current drive and path)
   ```

2. **Search your computer:**
   - **Windows:** Open File Explorer, search for "TCW1" in the search bar
   - **macOS:** Use Spotlight (Cmd + Space), type "TCW1"
   - **Linux:** Use file manager's search or run `find ~ -name "TCW1" -type d 2>/dev/null`

3. **Re-clone if needed:**
   ```bash
   # Navigate to where you want the project
   cd ~/Documents          # Or any preferred location

   # Clone the repository
   git clone https://github.com/xxd232/TCW1.git

   # Navigate into the project
   cd TCW1
   ```

4. **Verify you're in the right folder:**
   ```bash
   # You should see backend and frontend folders
   ls                      # macOS/Linux
   dir                     # Windows
   ```

### Backend or Frontend folder not found?

If you're inside the `TCW1` folder but can't find `backend` or `frontend`:

```bash
# Verify you're in the project root
ls -la                  # macOS/Linux
dir                     # Windows

# You should see:
# - backend/
# - frontend/
# - README.md
# - .gitignore
```

If these folders are missing, try pulling the latest changes:
```bash
git pull origin main
```

### Installation errors?

**Problem:** `npm install` fails with errors.

**Solution:**
```bash
# Make sure you're in the correct directory
cd backend              # For backend
# OR
cd frontend             # For frontend

# Then run
npm install
```

### Port already in use?

**Problem:** Server won't start because port 3000 or 3001 is already in use.

**Solution:**
```bash
# Find and kill the process using the port
# macOS/Linux:
lsof -ti:3000 | xargs kill -9        # For frontend
lsof -ti:3001 | xargs kill -9        # For backend

# Windows:
netstat -ano | findstr :3000         # Find PID
taskkill /PID <PID> /F               # Kill the process
```

Or modify the port in the configuration files.

---

## Support

For issues and questions, please open an issue on the GitHub repository.
