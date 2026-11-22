import mongoose, { Schema, Model, models } from "mongoose";
import { IWithdrawal } from "@/types";

const WithdrawalSchema = new Schema<IWithdrawal>(
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
    feePercentage: {
      type: Number,
      default: 10,
    },
    charge: {
      type: Number,
      required: true,
    },
    arrivalAmount: {
      type: Number,
      required: true,
    },
    targetAccount: {
      type: String,
      required: true,
      trim: true,
    },
    targetName: {
      type: String,
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

export const Withdrawal: Model<IWithdrawal> =
  models.Withdrawal || mongoose.model<IWithdrawal>("Withdrawal", WithdrawalSchema);

