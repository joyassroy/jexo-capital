import mongoose, { Schema, Model, models } from "mongoose";
import { IDeposit } from "@/types";

const DepositSchema = new Schema<IDeposit>(
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
    method: {
      type: String,
      enum: ["bKash", "Nagad", "USDT-BEP20"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    amountBDT: {
      type: Number,
      required: true,
    },
    amountUSDT: {
      type: Number,
      required: true,
      default: 0,
    },
    senderNumber: {
      type: String,
      required: true,
      trim: true,
    },
    transferType: {
      type: String,
      enum: ["send_money", "payment"],
      default: "send_money",
    },
    transactionId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    adminNote: {
      type: String,
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

export const Deposit: Model<IDeposit> =
  models.Deposit || mongoose.model<IDeposit>("Deposit", DepositSchema);

