import mongoose, { Schema, Model, models } from "mongoose";
import { IVipTier } from "@/types";

const VipTierSchema = new Schema<IVipTier>(
  {
    level: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    dailyReturn: {
      type: String,
      default: "5.00%",
    },
    dailyReturnPercent: {
      type: Number,
      default: 5.0,
    },
    numberOfOrders: {
      type: Number,
      default: 5,
    },
    commissionPerOrder: {
      type: String,
      default: "0.5%",
    },
    commissionPerOrderPercent: {
      type: Number,
      default: 0.5,
    },
    minBDT: {
      type: Number,
      required: true,
      default: 1000,
    },
    maxBDT: {
      type: Number,
      required: true,
      default: 2999,
    },
    minUSDT: {
      type: Number,
      default: 7.87,
    },
    maxUSDT: {
      type: Number,
      default: 23.61,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const VipTier: Model<IVipTier> =
  models.VipTier || mongoose.model<IVipTier>("VipTier", VipTierSchema);
