import mongoose, { Schema, Model, models } from "mongoose";
import { IBankWallet } from "@/types";

const BankWalletSchema = new Schema<IBankWallet>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    userPhone: {
      type: String,
    },
    userNickname: {
      type: String,
    },
    realName: {
      type: String,
      required: true,
      trim: true,
    },
    bankType: {
      type: String,
      enum: ["bKash", "Nagad", "USDT-BEP20"],
      required: true,
    },
    accountNumber: {
      type: String,
      default: "",
      trim: true,
    },
    usdtAddress: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
      index: true,
    },
    isLocked: {
      type: Boolean,
      default: true,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    reviewedBy: {
      type: String,
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const BankWallet: Model<IBankWallet> =
  models.BankWallet || mongoose.model<IBankWallet>("BankWallet", BankWalletSchema);
