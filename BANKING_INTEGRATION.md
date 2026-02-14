# Banking Integration Guide

This document describes the banking integration features added to TCW1, enabling users to link bank accounts and transfer funds between their bank and crypto wallet.

## Overview

The banking integration allows users to:
- Link multiple bank accounts (checking or savings)
- Deposit USD from bank to wallet (ACH or Wire transfer)
- Withdraw USD from wallet to bank (ACH or Wire transfer)
- View bank transaction history with real-time status updates

## Features

### Bank Account Management

#### Link Bank Account
Users can link their bank accounts by providing:
- Bank name
- Account holder name
- Account number (masked in display for security)
- Routing number (9-digit)
- Account type (checking or savings)

#### Account Verification
- New accounts require verification before use
- In this demo, verification is instant
- In production, use micro-deposit verification or Plaid API

#### Primary Account
- Users can set one account as primary for quick access
- Primary account is selected by default in transfer forms

### Bank Transfers

#### Deposit from Bank
Transfer funds from linked bank account to wallet:
- **ACH Transfer**: 3-5 business days, limit $100,000
- **Wire Transfer**: Same day, limit $1,000,000
- Real-time status tracking (pending → processing → completed)

#### Withdraw to Bank
Transfer funds from wallet to linked bank account:
- Same transfer options and limits as deposits
- Requires sufficient USD balance in wallet
- Funds are debited immediately, credited to bank based on transfer type

### Transaction History
- View all bank transfers with status
- Filter by type and status
- Auto-refresh every 5 seconds (toggleable)
- See completion times and failure reasons

## API Endpoints

### Bank Accounts
```
POST   /api/banking/accounts/link              - Link new bank account
GET    /api/banking/accounts/:userId           - Get all linked accounts
DELETE /api/banking/accounts/:userId/:accountId - Remove account
PUT    /api/banking/accounts/:userId/:accountId/primary - Set as primary
POST   /api/banking/accounts/:userId/:accountId/verify - Verify account
```

### Transfers
```
POST   /api/banking/deposit                    - Deposit from bank
POST   /api/banking/withdraw                   - Withdraw to bank
GET    /api/banking/transactions/:userId       - Get transaction history
```

## Usage Examples

### Linking a Bank Account

```typescript
const response = await api.linkBankAccount('user-001', {
  accountNumber: '1234567890',
  routingNumber: '123456789',
  accountType: 'checking',
  bankName: 'Chase Bank',
  accountHolderName: 'John Doe'
});
```

### Making a Deposit

```typescript
const response = await api.depositFromBank(
  'user-001',           // userId
  'bank-account-id',    // bankAccountId
  500.00,               // amount
  'ACH',                // transferType
  'Deposit for trading' // description (optional)
);
```

### Making a Withdrawal

```typescript
const response = await api.withdrawToBank(
  'user-001',           // userId
  'bank-account-id',    // bankAccountId
  1000.00,              // amount
  'WIRE',               // transferType
  'Profit withdrawal'   // description (optional)
);
```

## Frontend Components

### BankAccounts
Displays all linked accounts with options to:
- Add new account
- Verify account
- Set as primary
- Remove account

### BankDeposit
Form to deposit funds from bank:
- Select bank account
- Choose transfer type (ACH/Wire)
- Enter amount
- View estimated completion time

### BankWithdrawal
Form to withdraw funds to bank:
- Shows available USD balance
- Select bank account
- Choose transfer type
- Enter amount (with max button)
- Validates sufficient balance

### BankTransactions
Transaction history viewer:
- Shows all bank transfers
- Status indicators (pending/processing/completed/failed)
- Auto-refresh toggle
- Detailed transaction info

## Security Features

### Account Protection
- Account numbers are masked (shows only last 4 digits)
- Bank accounts require verification before use
- Primary account management for security

### Transfer Limits
- **ACH Maximum**: $100,000 per transfer
- **Wire Maximum**: $1,000,000 per transfer
- Validates sufficient balance for withdrawals

### Production Recommendations
1. **Rate Limiting**: Implement express-rate-limit
   - 5 requests per 15 minutes for verification
   - 10 requests per hour for transfers
   
2. **Job Queue**: Use Bull or BullMQ for async processing
   - Better error handling
   - Retry failed transfers
   - Monitor processing status

3. **Real Verification**: Integrate with Plaid API
   - Instant bank account verification
   - Secure credential handling
   - Better user experience

4. **Additional Security**:
   - 2FA for large transfers
   - Daily/weekly transfer limits
   - Email notifications for all transfers
   - IP-based fraud detection

## Database Models

### BankAccount
```typescript
{
  userId: string;
  accountNumber: string;      // Stored securely, masked in API
  routingNumber: string;
  accountType: 'checking' | 'savings';
  bankName: string;
  accountHolderName: string;
  isVerified: boolean;
  isPrimary: boolean;
  createdAt: Date;
  lastUsed?: Date;
}
```

### BankTransaction
```typescript
{
  userId: string;
  bankAccountId: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  transferType: 'ACH' | 'WIRE';
  description?: string;
  timestamp: Date;
  completedAt?: Date;
  failureReason?: string;
}
```

## Testing

### Manual Testing Steps

1. **Link Bank Account**:
   - Navigate to Banking menu
   - Click "Add Bank Account"
   - Fill in bank details
   - Click "Link Account"
   - Verify account appears in list

2. **Verify Account**:
   - Click "Verify" on unverified account
   - Check status changes to "Verified"

3. **Deposit Test**:
   - Select verified account
   - Enter amount (e.g., $100)
   - Choose ACH transfer
   - Submit deposit
   - Check transaction status in history
   - Verify USD balance increases

4. **Withdrawal Test**:
   - Ensure USD balance available
   - Select verified account
   - Enter amount
   - Choose Wire transfer
   - Submit withdrawal
   - Check transaction status
   - Verify USD balance decreases

5. **Transaction History**:
   - View all transactions
   - Observe status changes (processing → completed)
   - Test auto-refresh toggle

## Troubleshooting

### Common Issues

**Account won't verify**
- Check if account already exists
- Ensure account belongs to user

**Deposit fails**
- Verify account is verified
- Check transfer amount limits
- Review error message in transaction history

**Withdrawal fails**
- Ensure sufficient USD balance
- Verify account is verified
- Check transfer limits

**Transactions stuck in processing**
- Wait for simulated delay (3 seconds for ACH, 1 second for Wire)
- In production, check job queue status
- Review application logs

## Support

For issues or questions about banking integration:
1. Check transaction history for error messages
2. Review application logs
3. Verify MongoDB connection
4. Check backend API endpoints are running

## Future Enhancements

Planned improvements:
- [ ] Plaid integration for instant verification
- [ ] Real-time notifications
- [ ] Transaction receipts (PDF)
- [ ] Recurring transfers
- [ ] Transfer scheduling
- [ ] Multi-currency bank accounts
- [ ] International wire transfers
- [ ] Bank statement imports
- [ ] Spending analytics
