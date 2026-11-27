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
    receiverNumber: {
      type: String,
      trim: true,
      default: "",
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
    proofImage: {
      type: String,
      trim: true,
      default: "",
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
    isFirstDeposit: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Deposit: Model<IDeposit> =
  models.Deposit || mongoose.model<IDeposit>("Deposit", DepositSchema);

