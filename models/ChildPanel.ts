import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IChildPanel extends Document {
  userId: mongoose.Types.ObjectId;
  domain: string;
  adminName: string;
  adminPassword?: string; // Stored hashed
  priceInUsd: number;
  priceInNaira: number;
  subscriptionPrice: number;
  expiresAt: Date;
  autoRenew: boolean;
  status: 'pending' | 'active' | 'rejected' | 'cancelled' | 'expired';
  discounts: Map<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

const ChildPanelSchema: Schema<IChildPanel> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    domain: {
      type: String,
      required: [true, 'Please provide a domain'],
      unique: true,
      trim: true,
    },
    adminName: {
      type: String,
      required: [true, 'Please provide an admin username'],
      trim: true,
    },
    adminPassword: {
      type: String,
      required: [true, 'Please provide an admin password'],
    },
    priceInUsd: {
      type: Number,
      required: true,
      default: 10.99,
    },
    priceInNaira: {
      type: Number,
      required: true,
      default: 14287,
    },
    subscriptionPrice: {
      type: Number,
      default: 14287,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
    autoRenew: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'rejected', 'cancelled', 'expired'],
      default: 'pending',
    },
    discounts: {
      type: Map,
      of: Number,
      default: {}
    },
  },
  {
    timestamps: true,
  }
);

const ChildPanel: Model<IChildPanel> =
  mongoose.models.ChildPanel || mongoose.model<IChildPanel>('ChildPanel', ChildPanelSchema);

export default ChildPanel;
