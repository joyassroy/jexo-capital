import mongoose, { Schema, Model, models } from "mongoose";
import { ISetting } from "@/types";

const SettingSchema = new Schema<ISetting>(
  {
    key: {
      type: String,
      default: "default_settings",
      unique: true,
    },
    bkashNumber: {
      type: String,
      default: "01728967166",
    },
    bkashType: {
      type: String,
      enum: ["personal", "merchant"],
      default: "personal",
    },
    nagadNumber: {
      type: String,
      default: "01812345678",
    },
    nagadType: {
      type: String,
      enum: ["personal", "merchant"],
      default: "personal",
    },
    usdtBep20Address: {
      type: String,
      default: "TKrvSHzuR9CcvRwPGiDDb7kzPvCGU3jtyi",
    },
    usdtRateBDT: {
      type: Number,
      default: 127,
    },
    whatsappNumber: {
      type: String,
      default: "+8801700000000",
    },
    whatsappUrl: {
      type: String,
      default: "https://wa.me/8801700000000",
    },
    telegramGroupUrl: {
      type: String,
      default: "https://t.me/zexocapital_group",
    },
    telegramChannelUrl: {
      type: String,
      default: "https://t.me/zexocapital_channel",
    },
    homeTickerText: {
      type: String,
      default: "Zexo Capital is a USA-based International Investment Platform.",
    },
    noticeItems: {
      type: [String],
      default: [
        "1. Our manager will never send you any messages. If someone sends you a message, please block them.",
        "2. Do not share your personal information with anyone.",
        "3. Do not send money to anyone outside of the website.",
        "4. Keep your account number and password secure.",
        "5. For any assistance, please contact Customer Service.",
        "6. Withdrawal hours are Sunday to Thursday, from 9:00 AM to 5:00 PM (17:00).",
        "7. Deposits can be made at any time.",
        "8. The Telegram group is open from 9:00 AM to 10:00 PM.",
      ],
    },
    minWithdrawBDT: {
      type: Number,
      default: 250,
    },
    minWithdrawUSDT: {
      type: Number,
      default: 6,
    },
    signupBonusBDT: {
      type: Number,
      default: 500,
    },
    withdrawFeePercent: {
      type: Number,
      default: 10,
    },
    withdrawStartTime: {
      type: String,
      default: "09:00",
    },
    withdrawEndTime: {
      type: String,
      default: "17:00",
    },
    withdrawAllowedDays: {
      type: [Number],
      default: [0, 1, 2, 3, 4], // Sun, Mon, Tue, Wed, Thu
    },
    vipAutoActiveEnabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Setting: Model<ISetting> =
  models.Setting || mongoose.model<ISetting>("Setting", SettingSchema);

