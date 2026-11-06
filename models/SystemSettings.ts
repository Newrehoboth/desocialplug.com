import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISystemSettings extends Document {
  financialPin: string;
  isMaintenanceMode: boolean;
  maintenanceTitle: string;
  maintenanceMessage: string;
  globalPurchasingEnabled: boolean;
}

const SystemSettingsSchema: Schema<ISystemSettings> = new Schema(
  {
    financialPin: {
      type: String,
      default: "444666",
    },
    isMaintenanceMode: {
      type: Boolean,
      default: false,
    },
    globalPurchasingEnabled: {
      type: Boolean,
      default: true,
    },
    maintenanceTitle: {
      type: String,
      default: "System Under Maintenance",
    },
    maintenanceMessage: {
      type: String,
      default: "De'socialPlug is currently undergoing scheduled maintenance to improve performance and security. Please check back soon.",
    },
  },
  {
    timestamps: true,
  }
);

const SystemSettings: Model<ISystemSettings> =
  mongoose.models.SystemSettings || mongoose.model<ISystemSettings>("SystemSettings", SystemSettingsSchema);

export default SystemSettings;
