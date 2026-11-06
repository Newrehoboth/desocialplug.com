import mongoose, { Schema, Document, Model, PaginateModel } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

export interface INotification extends Document {
  userUUID?: string; // If null, it's a global notification
  type: 'purchase' | 'new_account' | 'payment' | 'notification';
  title: string;
  message: string;
  read: boolean;
  source?: 'purchases' | 'uploads' | 'notifications';
  createdAt: Date;
}

const NotificationSchema: Schema<INotification> = new Schema(
  {
    userUUID: { type: String }, // Can be null for global
    type: {
      type: String,
      enum: ['purchase', 'new_account', 'payment', 'notification'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    source: { type: String },
  },
  {
    timestamps: true,
  },
);

NotificationSchema.plugin(mongoosePaginate);

type NotificationModel = Model<INotification> & PaginateModel<INotification>;

const Notification: NotificationModel =
  (mongoose.models.Notification as NotificationModel) ||
  mongoose.model<INotification, NotificationModel>('Notification', NotificationSchema);

export default Notification;
