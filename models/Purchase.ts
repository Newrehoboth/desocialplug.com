import mongoose, { Schema, Document, Model, PaginateModel } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

export interface IPurchase extends Document {
  userUUID: string;
  quantity: number;
  platform: string;
  totalAmount: number;
  purchaseDate: Date;
  status: string;
  credentials?: any[];
  accountId?: string;
  subcategory?: string;
  type?: string;
  followers?: number;
  tutorialVideoUrl?: string;
}

const PurchaseSchema: Schema<IPurchase> = new Schema(
  {
    userUUID: { type: String, required: true },
    quantity: { type: Number, required: true },
    platform: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    purchaseDate: { type: Date, default: Date.now },
    status: { type: String, default: 'completed' },
    credentials: { type: [Schema.Types.Mixed] },
    accountId: { type: String },
    subcategory: { type: String },
    type: { type: String },
    followers: { type: Number, default: 0 },
    tutorialVideoUrl: { type: String, default: '' },
  },
  {
    timestamps: { createdAt: 'purchaseDate', updatedAt: false },
  },
);

PurchaseSchema.plugin(mongoosePaginate);

type PurchaseModel = Model<IPurchase> & PaginateModel<IPurchase>;

const Purchase: PurchaseModel =
  (mongoose.models.Purchase as PurchaseModel) ||
  mongoose.model<IPurchase, PurchaseModel>('Purchase', PurchaseSchema);

export default Purchase;
