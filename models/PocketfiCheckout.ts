import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPocketfiCheckout extends Document {
  paymentId: string;
  userId: string;
  amount: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const PocketfiCheckoutSchema: Schema<IPocketfiCheckout> = new Schema(
  {
    paymentId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, default: 'pending' },
  },
  {
    timestamps: true,
  },
);

const PocketfiCheckout: Model<IPocketfiCheckout> =
  mongoose.models.PocketfiCheckout ||
  mongoose.model<IPocketfiCheckout>('PocketfiCheckout', PocketfiCheckoutSchema);

export default PocketfiCheckout;
