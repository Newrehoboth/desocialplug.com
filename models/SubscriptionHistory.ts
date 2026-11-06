import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISubscriptionHistory extends Document {
  panelId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  amount: number;
  periodStart: Date;
  periodEnd: Date;
  status: 'success' | 'failed';
  createdAt: Date;
}

const SubscriptionHistorySchema: Schema<ISubscriptionHistory> = new Schema(
  {
    panelId: {
      type: Schema.Types.ObjectId,
      ref: 'ChildPanel',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    periodStart: {
      type: Date,
      required: true,
    },
    periodEnd: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['success', 'failed'],
      default: 'success',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const SubscriptionHistory: Model<ISubscriptionHistory> =
  mongoose.models.SubscriptionHistory || mongoose.model<ISubscriptionHistory>('SubscriptionHistory', SubscriptionHistorySchema);

export default SubscriptionHistory;
