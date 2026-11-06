import mongoose, { Schema, Document, Model, PaginateModel } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

export interface IAccount extends Document {
  olaz: string;
  files: string[];
  followers: number;
  logs: number;
  bulkLogs: string[];
  mailIncluded: boolean;
  platform: string;
  subcategory?: string;
  type?: string;
  price: number;
  status: string;
  visibleToUsers?: boolean;
  description?: string;
  descriptionHeader?: string;
  tutorialVideoUrl?: string;
  vpnType?: string;
  position?: number;
  userUUID?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AccountSchema: Schema<IAccount> = new Schema(
  {
    olaz: { type: String, required: true },
    files: [{ type: String }],
    followers: { type: Number, default: 0 },
    logs: { type: Number, default: 0 },
    bulkLogs: { type: [String], select: false },
    mailIncluded: { type: Boolean, default: false },
    platform: { type: String, required: true },
    subcategory: { type: String },
    type: { type: String },
    price: { type: Number, required: true },
    status: { type: String, default: 'Available' },
    visibleToUsers: { type: Boolean, default: true },
    userUUID: { type: String },
    description: { type: String },
    descriptionHeader: { type: String, default: '' },
    tutorialVideoUrl: { type: String, default: '' },
    vpnType: { type: String },
    position: { type: Number, default: 0, index: true },
  },
  {
    timestamps: true,
  },
);

AccountSchema.plugin(mongoosePaginate);

AccountSchema.pre('save' as any, async function (next: (n?: Error) => void) {
  try {
    const doc = this as IAccount;
    const position = typeof doc.position === 'number' ? doc.position : 0;

    if (Number.isFinite(position) && position > 0) {
      return next();
    }

    const AccountModel = doc.constructor as Model<IAccount>;
    const subcategory = doc.subcategory ?? '';

    const maxDoc = await AccountModel.findOne({
      platform: doc.platform,
      subcategory,
      position: { $gt: 0 },
      _id: { $ne: doc._id },
    })
      .sort({ position: -1 })
      .select({ position: 1 })
      .lean();

    const maxPos =
      maxDoc && typeof (maxDoc as any).position === 'number'
        ? (maxDoc as any).position
        : 0;

    doc.position = maxPos + 1;
    return next();
  } catch (err) {
    return next(err as Error);
  }
});

type AccountModel = Model<IAccount> & PaginateModel<IAccount>;

(AccountSchema.statics as any).backfillMissingPositions = async function (
  filter: Record<string, any> = {},
) {
  const AccountModel = this as Model<IAccount>;

  const docs: Array<
    Pick<
      IAccount,
      '_id' | 'platform' | 'subcategory' | 'position' | 'createdAt'
    >
  > = await AccountModel.find({
    ...filter,
    $or: [{ position: { $exists: false } }, { position: { $lte: 0 } }],
  })
    .select({ platform: 1, subcategory: 1, position: 1, createdAt: 1 })
    .sort({ platform: 1, subcategory: 1, createdAt: 1, _id: 1 })
    .lean();

  const byGroup = new Map<string, typeof docs>();
  for (const d of docs) {
    const key = `${(d as any).platform ?? ''}__${(d as any).subcategory ?? ''}`;
    const list = byGroup.get(key) ?? [];
    list.push(d);
    byGroup.set(key, list);
  }

  let updatedCount = 0;
  for (const [key, groupDocs] of byGroup.entries()) {
    const [platform, subcategory] = key.split('__');

    const maxDoc = await AccountModel.findOne({
      ...filter,
      platform,
      subcategory,
      position: { $gt: 0 },
    })
      .sort({ position: -1 })
      .select({ position: 1 })
      .lean();

    let nextPos =
      maxDoc && typeof (maxDoc as any).position === 'number'
        ? (maxDoc as any).position + 1
        : 1;

    for (const d of groupDocs) {
      await AccountModel.updateOne(
        { _id: (d as any)._id },
        { $set: { position: nextPos } },
      );
      nextPos += 1;
      updatedCount += 1;
    }
  }

  return { updatedCount };
};

const Account: AccountModel =
  (mongoose.models.Account as AccountModel) ||
  mongoose.model<IAccount, AccountModel>('Account', AccountSchema);

export default Account;
