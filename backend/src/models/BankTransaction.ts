import mongoose, { Schema, Document } from 'mongoose';

export interface IBankTransaction extends Document {
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

const BankTransactionSchema = new Schema<IBankTransaction>(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    bankAccountId: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['deposit', 'withdrawal'],
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
      default: 'pending'
    },
    transferType: {
      type: String,
      enum: ['ACH', 'WIRE'],
      required: true
    },
    description: {
      type: String
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    completedAt: {
      type: Date
    },
    failureReason: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

export const BankTransaction = mongoose.model<IBankTransaction>('BankTransaction', BankTransactionSchema);
