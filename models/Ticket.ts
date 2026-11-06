import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITicketMessage {
  sender: 'user' | 'admin';
  text: string;
  fileUrl?: string; // Base64 data URL for images
  createdAt: Date;
}

export interface ITicket extends Document {
  userId: mongoose.Types.ObjectId;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved';
  messages: ITicketMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const TicketMessageSchema = new Schema<ITicketMessage>(
  {
    sender: { type: String, enum: ['user', 'admin'], required: true },
    text: { type: String },
    fileUrl: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const TicketSchema = new Schema<ITicket>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved'],
      default: 'open',
    },
    messages: [TicketMessageSchema],
  },
  { timestamps: true },
);

const Ticket: Model<ITicket> =
  mongoose.models.Ticket || mongoose.model<ITicket>('Ticket', TicketSchema);

export default Ticket;
