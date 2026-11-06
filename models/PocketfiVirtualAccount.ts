import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPocketfiVirtualAccount extends Document {
  userId: string;
  businessId: string;
  bank: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  provider: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const PocketfiVirtualAccountSchema: Schema<IPocketfiVirtualAccount> =
  new Schema(
    {
      userId: { type: String, required: true, index: true },
      businessId: { type: String, required: true },
      bank: { type: String, required: true },
      bankName: { type: String, required: true },
      accountNumber: { type: String, required: true, index: true },
      accountName: { type: String, required: true },
      provider: { type: String, default: 'pocketfi' },
      status: { type: String, default: 'active' },
    },
    {
      timestamps: true,
    },
  );

const PocketfiVirtualAccount: Model<IPocketfiVirtualAccount> =
  mongoose.models.PocketfiVirtualAccount ||
  mongoose.model<IPocketfiVirtualAccount>(
    'PocketfiVirtualAccount',
    PocketfiVirtualAccountSchema,
  );

export default PocketfiVirtualAccount;
