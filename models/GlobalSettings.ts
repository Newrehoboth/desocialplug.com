import mongoose, { Schema, Document } from 'mongoose';

export interface IGlobalSettings extends Document {
  globalDiscounts: Map<string, number>;
  updatedAt: Date;
}

const GlobalSettingsSchema = new Schema({
  globalDiscounts: {
    type: Map,
    of: Number,
    default: {}
  }
}, { timestamps: true });

export default mongoose.models.GlobalSettings || mongoose.model<IGlobalSettings>('GlobalSettings', GlobalSettingsSchema);
