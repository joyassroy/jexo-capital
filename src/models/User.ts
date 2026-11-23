import mongoose, { Schema, Model, models } from "mongoose";
import { IUser } from "@/types";

const UserSchema = new Schema<IUser>(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    nickname: {
      type: String,
      required: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    withdrawPasswordHash: {
      type: String,
      default: undefined,
    },
    avatarUrl: {
      type: String,
      default: "",
    },
    balance: {
      type: Number,
      default: 0,
    },
    totalFund: {
      type: Number,
      default: 0,
    },
    fundIncome: {
      type: Number,
      default: 0,
    },
    yesterdayEarnings: {
      type: Number,
      default: 0,
    },
    todayEarnings: {
      type: Number,
      default: 0,
    },
    vipLevel: {
      type: Number,
      default: 0,
    },
    referralCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    referredBy: {
      type: String,
      default: undefined,
    },
    referralCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

export const User: Model<IUser> =
  models.User || mongoose.model<IUser>("User", UserSchema);

