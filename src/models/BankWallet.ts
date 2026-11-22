import mongoose, { Schema, Model, models } from "mongoose";
import { IBankWallet } from "@/types";

const BankWalletSchema = new Schema<IBankWallet>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
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
      required: true,
      trim: true,
    },
    usdtAddress: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const BankWallet: Model<IBankWallet> =
  models.BankWallet || mongoose.model<IBankWallet>("BankWallet", BankWalletSchema);

