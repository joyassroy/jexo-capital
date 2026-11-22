import mongoose, { Schema, Model, models } from "mongoose";
import { IAdmin } from "@/types";

const AdminSchema = new Schema<IAdmin>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["superadmin", "admin", "support"],
      default: "admin",
    },
    permissions: {
      type: [String],
      default: ["deposits", "withdrawals", "users", "settings"],
    },
  },
  {
    timestamps: true,
  }
);

export const Admin: Model<IAdmin> =
  models.Admin || mongoose.model<IAdmin>("Admin", AdminSchema);

