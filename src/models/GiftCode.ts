import mongoose, { Schema, Model, models } from "mongoose";
import { IGiftCode } from "@/types";

const GiftCodeSchema = new Schema<IGiftCode>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.0001,
    },
    maxUses: {
      type: Number,
      default: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    usedByUsers: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const GiftCode: Model<IGiftCode> =
  models.GiftCode || mongoose.model<IGiftCode>("GiftCode", GiftCodeSchema);

