import mongoose, { Schema, Model, models } from "mongoose";
import { IKyc } from "@/types";

const KycSchema = new Schema<IKyc>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    realName: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
      min: 18,
      max: 60,
    },
    gender: {
      type: String,
      required: true,
    },
    nidNumber: {
      type: String,
      required: true,
      trim: true,
    },
    frontPictureUrl: {
      type: String,
      required: true,
    },
    backPictureUrl: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminNote: {
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

export const Kyc: Model<IKyc> =
  models.Kyc || mongoose.model<IKyc>("Kyc", KycSchema);

