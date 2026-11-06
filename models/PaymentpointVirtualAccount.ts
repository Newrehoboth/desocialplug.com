import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPaymentpointVirtualAccount extends Document {
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

const PaymentpointVirtualAccountSchema: Schema<IPaymentpointVirtualAccount> =
  new Schema(
    {
      userId: { type: String, required: true, index: true },
      businessId: { type: String, required: true },
      bank: { type: String, required: true },
      bankName: { type: String, required: true },
      accountNumber: { type: String, required: true, index: true },
      accountName: { type: String, required: true },
      provider: { type: String, default: 'paymentpoint' },
      status: { type: String, default: 'active' },
    },
    {
      timestamps: true,
    },
  );

const PaymentpointVirtualAccount: Model<IPaymentpointVirtualAccount> =
  mongoose.models.PaymentpointVirtualAccount ||
  mongoose.model<IPaymentpointVirtualAccount>(
    'PaymentpointVirtualAccount',
    PaymentpointVirtualAccountSchema,
  );

export default PaymentpointVirtualAccount;
