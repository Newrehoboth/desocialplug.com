import mongoose, { Schema, Document, Model, PaginateModel } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

export interface IWithdrawRequest extends Document {
  userId: mongoose.Types.ObjectId;
  email: string;
  amount: number;
  bank: string;
  accountNumber: string;
  accountName: string;
  status: 'pending' | 'successful' | 'failed';
  referralBalanceAtRequest: number;
  deducted: boolean;
  deductedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WithdrawRequestSchema: Schema<IWithdrawRequest> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    email: { type: String, required: true },
    amount: { type: Number, required: true },
    bank: { type: String, required: true },
    accountNumber: { type: String, required: true },
    accountName: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'successful', 'failed'],
      default: 'pending',
    },
    referralBalanceAtRequest: { type: Number, required: true },
    deducted: { type: Boolean, default: false },
    deductedAt: { type: Date },
  },
  {
    timestamps: true,
  },
);

WithdrawRequestSchema.plugin(mongoosePaginate);

type WithdrawRequestModel = Model<IWithdrawRequest> &
  PaginateModel<IWithdrawRequest>;

const WithdrawRequest: WithdrawRequestModel =
  (mongoose.models.WithdrawRequest as WithdrawRequestModel) ||
  mongoose.model<IWithdrawRequest, WithdrawRequestModel>(
    'WithdrawRequest',
    WithdrawRequestSchema,
  );

export default WithdrawRequest;
