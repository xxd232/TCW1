import mongoose, { Schema, Document } from 'mongoose';

export interface IBankAccount extends Document {
  userId: string;
  accountNumber: string;
  routingNumber: string;
  accountType: 'checking' | 'savings';
  bankName: string;
  accountHolderName: string;
  isVerified: boolean;
  isPrimary: boolean;
  createdAt: Date;
  lastUsed?: Date;
}

const BankAccountSchema = new Schema<IBankAccount>(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    accountNumber: {
      type: String,
      required: true
    },
    routingNumber: {
      type: String,
      required: true
    },
    accountType: {
      type: String,
      enum: ['checking', 'savings'],
      required: true
    },
    bankName: {
      type: String,
      required: true
    },
    accountHolderName: {
      type: String,
      required: true
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    isPrimary: {
      type: Boolean,
      default: false
    },
    lastUsed: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

export const BankAccount = mongoose.model<IBankAccount>('BankAccount', BankAccountSchema);
